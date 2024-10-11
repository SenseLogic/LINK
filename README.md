![](https://github.com/senselogic/LINK/blob/master/LOGO/link.png)

# Link

Sitemap generation library.

## Features

- **Multilingual Support**: Generate sitemaps with alternate language links.
- **Natural Alphanumerical Sorting**: Automatically sort URLs in a human-friendly order.
- **Customization**: Set default change frequencies, crawl priorities and modification dates, or customize per route.
- **Flexible Output**: Generate sitemaps in desired directory structures.
- **Automatic File Splitting**: Split large sitemaps into multiple files respecting the 50000 URL limit.

## Installation

```bash
npm install senselogic-link
```

## Usage

```javascript
import { Sitemap } from 'senselogic-link';

let sitemap = new Sitemap(
    {
        websiteUrl : 'https://example.com',
        rootFolderPath : 'sitemaps/',
        changeFrequency : 'weekly',
        crawlPriority : 0.5
    }
    );

sitemap.addRoute( `/${ languageCode }/home`, 'main/', 'en' );
sitemap.addRoute( `/${ languageCode }/about`, 'main/', 'en' );

let productArray =
    [
        { id : 'product-1', name : 'Product 1' },
        { id : 'product-2', name : 'Product 2' }
    ];

for ( let languageCode of [ 'en', 'fr', 'de' ] )
{
    sitemap.addRoute( `/${ languageCode }/products`, 'products/', languageCode );

    for ( let product of productArray )
    {
        sitemap.addRoute(
            `/${ languageCode }/product/${ product.id }`,
            'products/',
            languageCode,
            { crawlPriority : 0.9 }
            );
    }
}

await sitemap.writeSitemapFiles();
```

## Limitations

*   Routes can't be added to the root sitemap file.
*   Folder paths must end with a slash character.
*   The language code must be placed immediately after the domain : `https://example.com/{languageCode}/...`

## Version

1.0

## Author

Eric Pelzer (ecstatic.coder@gmail.com).

## License

This project is licensed under the GNU Lesser General Public License version 3.

See the [LICENSE.md](LICENSE.md) file for details.
