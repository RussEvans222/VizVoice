# Getting Started with Tableau Next REST API

Welcome to the Tableau Next REST API. This guide will help you get started with using our API to programmatically manage and configure Tableau Next elements.

## Overview

The Tableau Next REST API allows you to programmatically:

- Create and update visualizations and workspaces.
- Get, update, and run subscription digests.
- Download asset images and metadata.
- Add and update followers for assets and collections of assets and query followed assets and followers for assets.
- Get and update user access to assets.

## Set Up Tableau Next

To use the Tableau Next REST APIs, ensure Tableau Next is provisioned and set up in your org. You also need a Salesforce user account with a Tableau Next Creator license and a Tableau Next Admin or Tableau Next Platform Analyst permission set.

For more information on setup and licenses, see [Set Up Tableau Next](https://help.salesforce.com/s/articleView?id=analytics.tua_admin.htm) and [Tableau Next Permission Sets and Licenses](https://help.salesforce.com/s/articleView?id=analytics.tua_admin_permsets_licenses.htm) in Salesforce Help.

## Prerequisites

Before you begin, ensure you have:

- Basic understanding of REST APIs and HTTP requests
- Your API credentials (see [Authentication](/docs/analytics/tableau-next-rest-api/guide/authentication.html))
- A REST API client (like cURL, Postman, or your preferred programming language)

## Making Your First Request

1. First, authenticate with the API (see [Authentication](/docs/analytics/tableau-next-rest-api/guide/authentication.html))
2. Try a simple GET request to check your connection:

```bash
curl -X GET https://<instance_name>/services/data/v64.0/tableau/visualizations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Learn more about Connect REST APIs

The Tableau Next Connect REST API is based on the Connect REST API and follows its conventions. For more information about the Connect REST API, set the [Connect Rest API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/intro_working_with_chatter_connect.htm)
