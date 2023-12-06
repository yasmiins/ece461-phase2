const simpleGit = require('simple-git');
const os = require('os');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const get_metric_scores = require('./dist/urlparse_cmd/process_url.js').default;
const AWS = require('aws-sdk');
const logger = require('./dist/logger.js').default;
const cors = require('cors');
const app = express();
const { v4: uuidv4 } = require('uuid');


// CORS configuration for development and production
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins =
            ['http://localhost:3000', 'http://ec2-18-222-159-163.us-east-2.compute.amazonaws.com'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true); // Allow
        } else {
            callback(new Error('Not allowed by CORS')); // Block
        }
    }
};

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));


// Enable CORS with the specified options
app.use(cors(corsOptions));

app.use(express.json());

AWS.config.update({
    region: 'us-east-2'
});
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();


/**
 * Define the API endpoint for uploading packages
 *
 * TODO: Implement rating check
 * TODO: Error handling for missing json
 */
app.post('/package', async (req, res) => {
    try {
        logger.debug("Received request to /package endpoint");
        let fileContent, tempDir, repoPath, zip, packageJson, packageName, packageVersion;

        // Check if both Content and URL are provided
        if (req.body.Content && req.body.URL) {
            logger.warn("Both Content and URL provided");
            return res.status(400).send({ message: "Both Content and URL cannot be set" });
        }

        if (req.body.Content) {
            logger.debug("Handling direct content upload");
            fileContent = Buffer.from(req.body.Content, 'base64');
            tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'package-'));
            fs.writeFileSync(path.join(tempDir, 'package.zip'), fileContent);

            zip = new AdmZip(path.join(tempDir, 'package.zip'));
            repoPath = path.join(tempDir, 'repo');
            zip.extractAllTo(repoPath, true);
        } else if (req.body.URL) {
            logger.debug("Handling URL upload");
            const packageURL = req.body.URL;
            tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'package-'));
            repoPath = path.join(tempDir, 'repo');
            const git = simpleGit();
            await git.clone(packageURL, repoPath);
        } else {
            logger.warn("No package content or URL provided");
            return res.status(400).send({ message: "No package content or URL provided" });
        }

        // Extract package name and version from package.json
        packageJson = JSON.parse(fs.readFileSync(path.join(repoPath, 'package.json'), 'utf8'));
        packageName = packageJson.name;
        packageVersion = packageJson.version;

        // Check if the package already exists
        const packageExists = await checkIfPackageExists(packageName, packageVersion);
        if (packageExists) {
            logger.warn("Package already exists");
            return res.status(409).send({ message: "Package already exists" });
        }

        const packageId = uuidv4();

        // Create a zip file from the extracted content
        zip = new AdmZip();
        zip.addLocalFolder(repoPath);
        const finalZipPath = path.join(tempDir, `${packageName}-${packageVersion}.zip`);
        zip.writeZip(finalZipPath);
        fileContent = fs.readFileSync(finalZipPath);

        const s3Params = {
            Bucket: '461zips',
            Key: `packages/${packageName}-${packageVersion}.zip`,
            Body: fileContent,
            Metadata: {
                'name': packageName,
                'version': packageVersion,
                'id': packageId
            }
        };

        // Upload to S3
        logger.debug("Uploading to S3");
        s3.upload(s3Params, async function (err, data) {
            if (err) {
                logger.error("Error uploading to S3", err);
                return res.status(500).send({ message: "Error uploading to S3" });
            }

            logger.debug("Package uploaded successfully");

            // Prepare DynamoDB entry
            const dynamoDBParams = {
                TableName: 'S3Metadata',
                Item: {
                    id: packageId,
                    s3Key: s3Params.Key,
                    name: packageName,
                    version: packageVersion
                }
            };

            // Write metadata to DynamoDB
            try {
                await dynamoDB.put(dynamoDBParams).promise();
                logger.debug("Metadata written to DynamoDB successfully");

                res.status(201).send({
                    metadata: {
                        Name: packageName,
                        Version: packageVersion,
                        ID: packageId
                    },
                    data: {
                        Content: req.body.Content || null,
                        URL: req.body.URL || null,
                        JSProgram: req.body.JSProgram || null
                    }
                });
            } catch (dbError) {
                logger.error("Error writing to DynamoDB", dbError);
                res.status(500).send({ message: "Error writing metadata to DynamoDB" });
            }
        });

        // Clean up temporary files
        fs.rmdirSync(tempDir, { recursive: true });
    } catch (error) {
        logger.error("Internal Server Error", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

async function checkIfPackageExists(packageId) {
    const params = {
        TableName: 'S3Metadata',
        Key: {
            id: packageId
        }
    };

    try {
        const result = await dynamoDB.get(params).promise();
        return result.Item;
    } catch (error) {
        logger.error("Error checking if package exists", error);
        throw error;
    }
}

// Define the API endpoint for retrieving packages
app.get('/package/:id', async (req, res) => {
    try {
        const packageId = req.params.id;

        // Get the S3 key from DynamoDB
        const s3Key = await getS3KeyFromDynamoDB(packageId);
        if (!s3Key) {
            return res.status(404).send({message: 'Package does not exist.'});
        }

        // Retrieve object from S3
        const s3Params = {
            Bucket: '461zips',
            Key: s3Key
        };

        logger.debug(`Fetching package data from S3 for package ${packageId}`);
        const data = await s3.getObject(s3Params).promise();
        const packageContent = data.Body.toString('base64');

        // Extract metadata from S3 object
        const metadata = {
            Name: data.Metadata['name'],
            Version: data.Metadata['version'],
            ID: data.Metadata['id']
        };

        // Extract GitHub URL from package.json inside the zip
        logger.debug(`Extracting GitHub URL from package.json inside the zip for package ${packageId}`);
        const gitHubURL = await fetchPackageGitHubURL(data.Body);

        // Prepare and send the package response
        const response = {
            metadata: metadata,
            data: {
                Content: packageContent,
                URL: gitHubURL,
                JSProgram: "if (process.argv.length === 7) { console.log('Success'); process.exit(0); } else " +
                    "{ console.log('Failed'); process.exit(1); }"
            }
        };

        logger.debug(`Package retrieved successfully for package ${packageId}`);
        res.status(200).json(response);
    } catch (error) {
        logger.error(`Error in GET /package/${req.params.id}`, error);
        if (error.code === 'NoSuchKey') {
            res.status(404).send({message: 'Package does not exist.'});
        } else {
            res.status(500).send({message: 'Internal Server Error'});
        }
    }
});

// Define the API endpoint for updating packages
app.put('/package/:id', async (req, res) => {
    try {
        logger.info(`Received request to /package/:${req.params.id}`);
        const packageId = req.params.id;
        const {metadata, data} = req.body;

        // Validate request body
        if (!metadata || !data || !metadata.Name || !metadata.Version || !metadata.ID) {
            logger.warn("Invalid request data");
            return res.status(400).send({message: "Invalid request data"});
        }

        // Check if package ID matches with metadata ID
        if (packageId !== metadata.ID) {
            logger.warn("Package ID mismatch");
            return res.status(400).send({message: "Package ID mismatch"});
        }

        logger.debug("Request body validated. Checking if package exists...")
        // Check if the package exists in DynamoDB
        const dynamoDBGetParams = {
            TableName: 'S3Metadata',
            Key: {id: packageId}
        };

        const result = await dynamoDB.get(dynamoDBGetParams).promise();
        if (!result.Item) {
            return res.status(404).send({message: 'Package does not exist.'});
        }

        logger.debug("Package exists. Updating...");
        // Update package in S3
        const s3Key = `packages/${metadata.Name}-${metadata.Version}.zip`;
        const updateParams = {
            Bucket: '461zips',
            Key: s3Key,
            Body: Buffer.from(data.Content, 'base64'),
            Metadata: {
                'name': metadata.Name,
                'version': metadata.Version,
                'id': metadata.ID
            }
        };

        await s3.upload(updateParams).promise();
        logger.debug("Package updated in S3");

        // Update DynamoDB entry
        const dynamoDBUpdateParams = {
            TableName: 'S3Metadata',
            Key: {id: packageId},
            UpdateExpression: "set s3Key = :s",
            ExpressionAttributeValues: {
                ":s": s3Key
            }
        };

        await dynamoDB.update(dynamoDBUpdateParams).promise();
        logger.debug("DynamoDB entry updated");

        res.status(200).send({message: "Package updated successfully"});
    } catch (error) {
        logger.error("Error in PUT /package/:id", error);
        res.status(500).send({message: "Internal Server Error"});
    }
});

// Define the API endpoint for rating NPM packages
app.get('/package/:id/rate', async (req, res) => {
    try {
        const packageId = req.params.id;

        // Get the S3 key from DynamoDB
        const s3Key = await getS3KeyFromDynamoDB(packageId);
        if (!s3Key) {
            return res.status(404).send({message: 'Package does not exist.'});
        }

        // Retrieve object from S3
        const s3Params = {
            Bucket: '461zips',
            Key: s3Key
        };

        logger.debug(`Fetching package data from S3 for package ${packageId}`);
        const data = await s3.getObject(s3Params).promise();

        // Extract GitHub URL from package.json inside the zip
        logger.debug(`Extracting GitHub URL from package.json inside the zip for package ${packageId}`);
        const gitHubURL = await fetchPackageGitHubURL(data.Body);

        // Create a temporary file with the GitHub URL and pass it to get_metric_scores
        const tempFilePath = path.join(os.tmpdir(), `${packageId}-urls.txt`);
        fs.writeFileSync(tempFilePath, gitHubURL + '\n');

        // Get metric scores
        const scores = await get_metric_scores(tempFilePath);
        res.json(scores);

        // Cleanup temporary file
        fs.unlinkSync(tempFilePath);
    } catch (error) {
        logger.error(`Error in GET /package/${req.params.id}/rate`, error);
        res.status(500).send({message: 'Internal Server Error'});
    }
});

// Define the API endpoint for listing NPM packages in the directory
app.post('/packages', async (req, res) => {
    try {
        logger.info("Received request to /packages endpoint");
        const packageQueries = req.body;
        const offset = req.query.offset ? JSON.parse(req.query.offset) : null;
        const limit = 55; // Adjust as per requirement

        logger.debug("Validating request body");
        if (!Array.isArray(packageQueries) || packageQueries.length === 0) {
            return res.status(400).send({ message: "Invalid request body" });
        }

        const results = [];
        let lastEvaluatedKey = offset;

        for (const query of packageQueries) {
            const scanParams = {
                TableName: "S3Metadata",
                Limit: limit,
                ExclusiveStartKey: lastEvaluatedKey,
                FilterExpression: "Name = :nameVal",
                ExpressionAttributeValues: { ":nameVal": query.Name }
            };

            if (query.Version) {
                scanParams.FilterExpression += " and Version = :versionVal";
                scanParams.ExpressionAttributeValues[":versionVal"] = query.Version;
            }

            logger.debug(`Scanning DynamoDB with parameters: ${JSON.stringify(scanParams)}`);
            const queryResult = await dynamoDB.scan(scanParams).promise();
            results.push(...queryResult.Items.map(item => ({
                Name: item.Name,
                Version: item.Version,
                ID: item.ID
            })));
            lastEvaluatedKey = queryResult.LastEvaluatedKey;
            if (results.length >= limit) {
                break; // Stop if the limit is reached
            }
        }

        res.header('offset', lastEvaluatedKey ? JSON.stringify(lastEvaluatedKey) : null);
        res.status(200).json(results);
    } catch (error) {
        logger.error('Error in POST /packages:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Define the API endpoint for deleting NPM packages
app.delete('/reset', async (req, res) => {
    try {
        logger.info("Received request to /reset endpoint. Emptying S3 bucket...");
        const listParams = { Bucket: '461zips' };
        const listedObjects = await s3.listObjectsV2(listParams).promise();

        logger.debug("Number of objects in the bucket: " + listedObjects.Contents.length);
        if (listedObjects.Contents.length === 0) return;

        const deleteParams = {
            Bucket: '461zips',
            Delete: { Objects: [] }
        };

        listedObjects.Contents.forEach(({ Key }) => {
            deleteParams.Delete.Objects.push({ Key });
        });

        await s3.deleteObjects(deleteParams).promise();

        if (listedObjects.IsTruncated) await emptyS3Bucket();

       logger.debug("S3 bucket emptied successfully. Deleting DynamoDB entries...");
        const scanResult = await dynamoDB.scan({ TableName: 'S3Metadata' }).promise();

        for (const item of scanResult.Items) {
            await dynamoDB.delete({
                TableName: 'S3Metadata',
                Key: { id: item.id }
            }).promise();
        }

        logger.debug("DynamoDB entries deleted successfully. Reset complete.");
        res.status(200).send({ message: "Registry is reset." });
    } catch (error) {
        logger.error("Error resetting registry", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});



// Other endpoints TBA

async function emptyS3Bucket() {
    const listedObjects = await s3.listObjectsV2({ Bucket: '461zips' }).promise();

    if (listedObjects.Contents.length === 0) return;

    const deleteParams = {
        Bucket: '461zips',
        Delete: { Objects: [] }
    };

    listedObjects.Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
    });

    await s3.deleteObjects(deleteParams).promise();

    if (listedObjects.IsTruncated) await emptyS3Bucket();
}

const fetchPackageGitHubURL = async (zipBuffer) => {
    logger.debug("Starting fetchPackageGitHubURL function");
    const zip = new AdmZip(zipBuffer);
    const packageJsonEntry = zip.getEntry("package.json");

    if (!packageJsonEntry) {
        logger.warn("package.json not found in the zip file");
        throw new Error("package.json not found in the zip file");
    }

    const packageJsonContent = JSON.parse(packageJsonEntry.getData().toString('utf-8'));

    let gitHubURL;
    const repository = packageJsonContent.repository;

    if (typeof repository === 'string') {
        // Handle string format
        gitHubURL = `https://github.com/${repository}`;
    } else if (repository && repository.url) {
        // Handle object format with URL
        gitHubURL = repository.url;

        // Trimming 'git+' prefix if present
        if (gitHubURL.startsWith('git+')) {
            logger.debug("Trimming 'git+' prefix from GitHub URL");
            gitHubURL = gitHubURL.substring(4);
        }

        // Trimming '.git' suffix if present
        if (gitHubURL.endsWith('.git')) {
            logger.debug("Trimming '.git' suffix from GitHub URL");
            gitHubURL = gitHubURL.slice(0, -4);
        }
    } else {
        gitHubURL = "URL not found";
    }

    logger.debug(`Finished fetchPackageGitHubURL function, GitHub URL is ${gitHubURL}`);
    return gitHubURL;
};

async function getS3KeyFromDynamoDB(id) {
    const params = {
        TableName: 'S3Metadata',
        Key: {
            id: id
        }
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item ? result.Item.s3Key : null;
}

const port = 80;
app.listen(port, '0.0.0.0', () => {
    logger.debug(`Server listening on port ${port}`);
});