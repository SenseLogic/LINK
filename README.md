![](https://github.com/senselogic/LINK/blob/master/LOGO/link.png)

# Link

Sitemap generation library.

## Features

- **Multilingual Support**: Generate sitemaps with alternate language links (`xhtml:link` tags).
- **Route Patterns**: Define URL patterns with placeholders for dynamic parameters.
- **Natural Alphanumerical Sorting**: Automatically sort URLs in a human-friendly order.
- **Automatic File Splitting**: Split large sitemaps into multiple files respecting the 50000 URL limit.
- **Customization**: Set default change frequencies and crawl priorities, or customize per route.
- **Flexible Output**: Generate sitemaps in desired directory structures.

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
        changeFrequency : 'weekly',
        crawlPriority : 0.5,
        rootFolderPath : 'sitemaps/'
    }
    );

sitemap.addRoute(
    '/{languageCode}/home',
    { languageCode : 'en' },
    '',
    'en'
    );

sitemap.addRoute(
    '/{languageCode}/about',
    { languageCode : 'en' },
    '',
    'en'
    );

let productArray =
    [
        { id : 'product-1', name : 'Product 1' },
        { id : 'product-2', name : 'Product 2' }
    ];

for ( let languageCode of [ 'en', 'fr', 'de' ] )
{
    sitemap.addRoute(
        '/{languageCode}/products',
        { languageCode },
        'products',
        languageCode
        );

    for ( let product of productArray )
    {
        sitemap.addRoute(
            '/{languageCode}/product/{productId}',
            { languageCode, productId : product.id, crawlPriority : 0.9 },
            'products',
            languageCode
            );
    }
}

await sitemap.writeSitemapFiles();
```

## Limitations

*   The language code is expected to be placed immediately after the domain when generating the canonical URL : `https://example.com/{languageCode}/path`.

## Version

1.0

## Author

Eric Pelzer (ecstatic.coder@gmail.com).

## License

This project is licensed under the GNU Lesser General Public License version 3.

See the [LICENSE.md](LICENSE.md) file for details.
