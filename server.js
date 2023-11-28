const simpleGit = require('simple-git');
const os = require('os');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const express = require('express');
const get_metric_scores = require('./dist/urlparse_cmd/process_url.js').default;
const AWS = require('aws-sdk');
const logger = require('./dist/logger.js').default;
const cors = require('cors');
const app = express();

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


// Enable CORS with the specified options
app.use(cors(corsOptions));

app.use(express.json());

AWS.config.update({
    region: 'us-east-2'
});
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();


// Define the API endpoint for uploading NPM packages
app.post('/package', async (req, res) => {
    try {
        logger.debug("Received request to /package endpoint");

        const metadata = req.body.metadata;

        if (!metadata || !metadata.Name || !metadata.Version || !metadata.ID) {
            logger.warn("Incomplete package metadata provided");
            return res.status(400).send({message: "Incomplete package metadata provided"});
        }

        let fileContent, tempFilePath;

        if (req.body.Content) {
            logger.debug("Handling direct content upload");
            fileContent = Buffer.from(req.body.Content, 'base64');
        } else if (req.body.URL) {
            logger.debug("Handling URL upload");
            const packageURL = req.body.URL;

            // Temporary directory for cloning
            const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'package-'));
            const repoPath = path.join(tempDir, metadata.Name);
            const git = simpleGit();

            try {
                logger.debug(`Cloning repository from ${packageURL}`);
                await git.clone(packageURL, repoPath);

                // Create a zip file from the downloaded repository
                const zip = new AdmZip();
                zip.addLocalFolder(repoPath);
                tempFilePath = path.join(tempDir, `${metadata.Name}.zip`);
                zip.writeZip(tempFilePath);
                logger.debug(`Created zip file at ${tempFilePath}`);

                fileContent = fs.readFileSync(tempFilePath);
            } catch (gitError) {
                logger.error("Error during repository cloning or zipping", gitError);
                return res.status(500).send({message: "Error processing repository"});
            } finally {
                // Clean up
                fs.rmdirSync(tempDir, {recursive: true});
                logger.debug("Cleaned up temporary files");
            }
        } else {
            logger.warn("No package content or URL provided");
            return res.status(400).send({message: "No package content or URL provided"});
        }

        const params = {
            Bucket: '461zips',
            Key: `packages/${metadata.Name}-${metadata.Version}.zip`,
            Body: fileContent,
            Metadata: {
                'name': metadata.Name,
                'version': metadata.Version,
                'id': metadata.ID
            }
        };

        // Upload to S3
        logger.debug("Uploading to S3");
        s3.upload(params, async function (err, data) {
            if (err) {
                logger.error("Error uploading to S3", err);
                return res.status(500).send({message: "Error uploading to S3"});
            }

            logger.debug("Package uploaded successfully");

            // Prepare DynamoDB entry
            const dynamoDBParams = {
                TableName: 'S3Metadata',
                Item: {
                    id: metadata.ID,
                    s3Key: params.Key
                }
            };

            // Write metadata to DynamoDB
            try {
                await dynamoDB.put(dynamoDBParams).promise();
                logger.debug("Metadata written to DynamoDB successfully");

                res.status(201).send({
                    message: "Package uploaded successfully",
                    s3Location: data.Location
                });
            } catch (dbError) {
                logger.error("Error writing to DynamoDB", dbError);
                res.status(500).send({message: "Error writing metadata to DynamoDB"});
            }
        });

    } catch (error) {
        logger.error("Internal Server Error", error);
        res.status(500).send({message: "Internal Server Error"});
    }
});

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
        const packageId = req.params.id;
        const {metadata, data} = req.body;

        // Validate request body
        if (!metadata || !data || !metadata.Name || !metadata.Version || !metadata.ID) {
            return res.status(400).send({message: "Invalid request data"});
        }

        // Check if package ID matches with metadata ID
        if (packageId !== metadata.ID) {
            return res.status(400).send({message: "Package ID mismatch"});
        }

        // Check if the package exists in DynamoDB
        const dynamoDBGetParams = {
            TableName: 'S3Metadata',
            Key: {id: packageId}
        };

        const result = await dynamoDB.get(dynamoDBGetParams).promise();
        if (!result.Item) {
            return res.status(404).send({message: 'Package does not exist.'});
        }

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

// Other endpoints TBA

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