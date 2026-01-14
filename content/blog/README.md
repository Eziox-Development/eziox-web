# Blog Posts

This directory contains all blog posts as Markdown files with YAML frontmatter.

## Creating a New Blog Post

1. Create a new `.md` file in this directory (e.g., `my-new-post.md`)
2. Add frontmatter at the top with metadata
3. Write your content in Markdown below the frontmatter

## Example Structure

```markdown
---
slug: my-awesome-project
title: My Awesome Project - Building Something Cool
excerpt: A brief description of what this post is about.
publishDate: 2026-01-13
category: Web Development
tags:
  - react
  - typescript
  - featured
coverImage: /blog-images/my-project.jpg
coverImageAlt: Project screenshot
readingTime: 8
featured: true
author: Saito
authorEmail: your-email@example.com
projectUrl: https://example.com
githubUrl: https://github.com/username/repo
---

## Your Content Here

Write your blog post content using Markdown...
```

## Available Fields

- **slug** (required): URL-friendly identifier
- **title** (required): Post title
- **excerpt** (required): Short description
- **publishDate** (required): YYYY-MM-DD format
- **category** (required): Post category
- **tags** (required): Array of tags
- **coverImage** (optional): Path to cover image
- **coverImageAlt** (optional): Alt text for cover image
- **readingTime** (optional): Estimated reading time in minutes
- **featured** (optional): Show in featured posts (true/false)
- **author** (optional): Author name
- **projectUrl** (optional): Link to live project
- **githubUrl** (optional): Link to GitHub repository

## Tips

- Use proper Markdown formatting
- Add code blocks with syntax highlighting
- Include images from `/public/blog-images/`
- Keep excerpts concise (1-2 sentences)
- Add relevant tags for discoverability
