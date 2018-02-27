# Gatsby Directus

A [Gatsby](https://www.gatsbyjs.org) source plugin for [Directus](https://getdirectus.com/).

## Features

This plugin converts your Directus content schema into Gatsby nodes. Allowing you to use your data in Directus to build out your static sites.

- Converts image columns into image sharp compatible gatsby nodes
- Converts markdown columns into markdown compatible gatsby nodes
- Recursively builds child nodes for relational data. (currently only implemented for Many-To-Many, but more to come)