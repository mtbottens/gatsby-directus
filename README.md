# Gatsby Directus

[![Build Status](https://travis-ci.org/mtbottens/gatsby-directus.svg?branch=master)](https://travis-ci.org/mtbottens/gatsby-directus)

A [Gatsby](https://www.gatsbyjs.org) source plugin for [Directus](https://getdirectus.com/).

## Features

This plugin converts your Directus content schema into Gatsby nodes. Allowing you to use your data in Directus to build out your static sites.

- Converts image columns into image sharp compatible gatsby nodes
    - requires gatsby-image
    - requires gatsby-plugin-sharp
    - requires gatsby-transformer-sharp
    - if these plugins aren't available, no image processing will be done
- Converts markdown columns into markdown compatible gatsby nodes
- Recursively builds child nodes for relational data.
	- Many to One relations
	- Many to Many relations
- Properly handles toggle ui elements from gatsby to transform them into boolean values


## Installation

`npm install --save gatsby-directus`

## Configuration

Add gatsby-directus to the plugins in gatsby-config.js

Example: 

```javascript
module.exports = {
  siteMetadata: {
    title: 'Gatsby Default Starter',
  },
  plugins: [
    {
      resolve: `gatsby-directus`,
      options: {
        url: `https://api.mydirectusdomain.com`,
        accessToken: `AKDJFKDJ@#@#@`,
        advancedImageProcessingEnabled: false 
      }
    },
    'gatsby-plugin-react-helmet'
  ],
};

```

### Image Processing

This plugin processes directus images into image sharp compatible nodes as long as gatsby-image is installed, however, you may get issues if you don't have gatsby-plugin-sharp and gatsby-transformer-sharp installed as well. 

It does this by downloading the images into .cache/directus.

`npm install --save gatsby-image gatsby-plugin-sharp gatsby-transformer-sharp`

Additionally, in order to transform gatsby image nodes we need to pass in an option to gatsby-directus telling it to include those transformers.

Example Config:

```javascript
module.exports = {
  siteMetadata: {
    title: 'Gatsby Default Starter',
  },
  plugins: [
    {
      resolve: `gatsby-directus`,
      options: {
        url: `https://api.mydirectusdomain.com`,
        accessToken: `AKDJFKDJ@#@#@`,
        advancedImageProcessingEnabled: true
      }
    },
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    'gatsby-plugin-react-helmet'
  ],
};

```