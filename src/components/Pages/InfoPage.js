// InfoPage.js
import React from 'react';
import Layout from '../Pages/Layout';
import './InfoPage.css'

const InfoPage = () => {
  return (
    <Layout>
      <div style={{ textAlign: 'center' }}>
        <h1>Info Page</h1>
      </div>
      {/* Add content specific to the home page */}
  <div className="container">
  <h1>Introduction</h1>
  <p>Welcome to our API documentation. Our system provides a robust solution for managing npm packages, integrating with AWS services for scalability and reliability. Our RESTful API enables users to perform CRUD operations on packages, extend metrics, ingest public npm packages, search for packages, and reset the system to its default state.</p>

  <h1>System Architecture Overview</h1>
  <p>Our service is built on AWS, leveraging services such as DynamoDB for our database needs, S3 for storage, API Gateway for managing requests, and Lambda for serverless compute. User management is secured through IAM and CloudFront. We ensure quality and reliability with a Testing Framework that includes Jest for backend tests and Selenium for frontend tests.</p>

  <h1>API Endpoints</h1>
  <h2>CRUD Operations</h2>
  <ul>
    <li><strong>Create:</strong> Upload new packages to our system using <code>POST /package</code>.</li>
    <li><strong>Read:</strong> Retrieve package details using <code>GET /package/:id</code>.</li>
    <li><strong>Update:</strong> Modify existing packages with <code>PUT /package/:id</code>.</li>
    <li><strong>Delete:</strong> Remove packages from the system using <code>DELETE /package/:id</code>.</li>
  </ul>

  <h2>Metrics and Process Extension</h2>
  <p>New Metrics: Extend API capabilities by requesting new metrics that can be accommodated within our processing pipeline.</p>

  <h2>Ingestion of Public Packages</h2>
  <p>Integrate public npm packages seamlessly into our system, allowing for broader package management and version control.</p>

  <h2>Package Search</h2>
  <p>Utilize our <code>GET /package/:id</code> endpoint with query parameters to search for specific packages in our directory.</p>

  <h2>Package Directory</h2>
  <p>Access a comprehensive directory of all available packages using our <code>GET /packages</code> endpoint.</p>

  <h2>System Reset</h2>
  <p>Return the system to its initial state with our <code>DELETE /reset</code> endpoint, clearing all data and configurations.</p>

  <h2>Regular Expression Search</h2>
  <p>Extend the search functionality to use regular expressions for package names and READMEs with <code>POST /package/byRegEx</code>.</p>
</div>

    </Layout>
  );
};

export default InfoPage;
