// -- IMPORTS

import assert from 'assert';
import fs from 'fs';
import path from 'path';

// -- TYPES

export class SitemapRoute
{
    // -- CONSTRUCTORS

    constructor(
        routePattern,
        parameterByNameMap,
        subFolderPath,
        websiteUrl,
        languageCode = undefined
        )
    {
        assert(
            subFolderPath.length > 1
            && subFolderPath.endsWith( '/' )
            );

        this.routePattern = routePattern;
        this.parameterByNameMap = parameterByNameMap;
        this.subFolderPath = subFolderPath;
        this.websiteUrl = websiteUrl;
        this.languageCode = languageCode;
    }

    // ~~

    getUrl(
        )
    {
        let url = this.routePattern;

        for ( let parameterName in this.parameterByNameMap )
        {
            url = url.replaceAll( `{${ parameterName }}`, encodeURIComponent( this.parameterByNameMap[ parameterName ] ) );
        }

        return `${ this.websiteUrl }${ url }`;
    }

    // ~~

    getCanonicalUrl(
        )
    {
        let url = this.getUrl();

        if ( this.languageCode !== undefined )
        {
            let urlPrefix = this.websiteUrl + this.languageCode;

            if ( url === urlPrefix )
            {
                return this.websiteUrl;
            }
            else if ( url.startsWith( urlPrefix + '/' ) )
            {
                return this.websiteUrl + url.slice( urlPrefix.length + 1 );
            }
        }

        return url;
    }
}

// ~~

export class Sitemap
{
    // -- CONSTRUCTORS

    constructor(
        {
            websiteUrl = '',
            changeFrequency = 'monthly',
            crawlPriority = 0.5,
            rootFolderPath = '',
            maximumUrlCountPerFile = 50000
        }
        )
    {
        assert(
            rootFolderPath === ''
            || rootFolderPath.endsWith( '/' )
            );

        this.websiteUrl = websiteUrl;
        this.changeFrequency = changeFrequency;
        this.crawlPriority = crawlPriority;
        this.rootFolderPath = rootFolderPath;
        this.maximumUrlCountPerFile = maximumUrlCountPerFile;
        this.routeArray = [];
    }

    // -- INQUIRIES

    async writeFile(
        filePath,
        fileText
        )
    {
        try
        {
            await fs.promises.writeFile( filePath, fileText );
        }
        catch ( error )
        {
            console.error( `Can't write ${filePath} :`, error );
        }
    }

    // ~~

    getRouteArrayBySubFolderMap(
        routeArray = undefined
        )
    {
        if ( routeArray == undefined )
        {
            routeArray = this.routeArray;
        }

        let routeArrayBySubFolderMap = {};

        for ( let route of routeArray )
        {
            if ( !routeArrayBySubFolderMap[ route.subFolderPath ] )
            {
                routeArrayBySubFolderMap[ route.subFolderPath ] = [];
            }

            routeArrayBySubFolderMap[ route.subFolderPath ].push( route );
        }

        return routeArrayBySubFolderMap;
    }

    // ~~

    getRootSitemapFileText(
        rootSitemapFileArray
        )
    {
        let sitemapFileText =
            `<?xml version="1.0" encoding="UTF-8"?>\n`
            + `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        for ( let sitemapFile of rootSitemapFileArray )
        {
            let fileUrl = `${ this.websiteUrl }${ this.rootFolderPath }${ sitemapFile.subFolderPath }${ sitemapFile.fileName }`;

            sitemapFileText +=
                `<sitemap>\n`
                + `  <loc>${ fileUrl }</loc>\n`
                + `</sitemap>\n`;
        }

        sitemapFileText += `</sitemapindex>\n`;

        return sitemapFileText;
    }

    // ~~

    getSitemapFileText(
        canonicalUrlArray,
        routeArrayByCanonicalUrlMap
        )
    {
        let sitemapFileText =
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
            `xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

        for ( let canonicalUrl of canonicalUrlArray )
        {
            let routeArray = routeArrayByCanonicalUrlMap[ canonicalUrl ];
            sitemapFileText += `<url>\n`;
            sitemapFileText += `  <loc>${ canonicalUrl }</loc>\n`;

            for ( let route of routeArray )
            {
                sitemapFileText +=
                    `  <xhtml:link rel="alternate" hreflang="${ route.languageCode }" href="${ route.getUrl() }" />\n`;
            }

            let firstRoute = routeArray[ 0 ];
            sitemapFileText += `  <changefreq>${ firstRoute.parameterByNameMap.changeFrequency }</changefreq>\n`;
            sitemapFileText += `  <priority>${ firstRoute.parameterByNameMap.crawlPriority }</priority>\n`;
            sitemapFileText += `</url>\n`;
        }

        sitemapFileText += `</urlset>\n`;

        return sitemapFileText;
    }

    // ~~

    async createFolder(
        folderPath
        )
    {
        try
        {
            await fs.promises.access( folderPath );
        }
        catch ( error )
        {
            await fs.promises.mkdir( folderPath, { recursive: true } );
        }
    }

    // ~~

    async writeSitemapFile(
        rootFolderPath,
        subFolderPath,
        canonicalUrlArray,
        routeArrayByCanonicalUrlMap,
        fileName = 'sitemap.xml'
        )
    {
        let folderPath = path.join( rootFolderPath, subFolderPath );
        await this.createFolder( folderPath );

        let sitemapFileText = this.getSitemapFileText( canonicalUrlArray, routeArrayByCanonicalUrlMap );
        let sitemapFilePath = path.join( folderPath, fileName );

        await this.writeFile( sitemapFilePath, sitemapFileText );
    }

    // ~~

    async writeRootSitemapFile(
        rootFolderPath,
        rootSitemapFileArray
        )
    {
        await this.createFolder( rootFolderPath );

        let rootSitemapFileText = this.getRootSitemapFileText( rootSitemapFileArray );
        let rootSitemapFilePath = path.join( rootFolderPath, 'sitemap.xml' );

        await this.writeFile( rootSitemapFilePath, rootSitemapFileText );

        for ( let sitemapFile of rootSitemapFileArray )
        {
            await this.writeSitemapFile(
                rootFolderPath,
                sitemapFile.subFolderPath,
                sitemapFile.canonicalUrlArray,
                sitemapFile.routeArrayByCanonicalUrlMap,
                sitemapFile.fileName
                );
        }
    }

    // ~~

    async writeSitemapFiles(
        )
    {
        let routeArrayBySubFolderMap = this.getRouteArrayBySubFolderMap();
        let rootSitemapFileArray = [];

        for ( let subFolderPath in routeArrayBySubFolderMap )
        {
            let routeArray = routeArrayBySubFolderMap[ subFolderPath ];

            routeArray.sort(
                ( a, b ) =>
                a.getCanonicalUrl().localeCompare(
                    b.getCanonicalUrl(),
                    undefined,
                    {
                        numeric: true,
                        sensitivity: 'base'
                    }
                    )
                );

            let routeArrayByCanonicalUrlMap = {};

            for ( let route of routeArray )
            {
                let canonicalUrl = route.getCanonicalUrl();

                if ( !routeArrayByCanonicalUrlMap[ canonicalUrl ] )
                {
                    routeArrayByCanonicalUrlMap[ canonicalUrl ] = [];
                }

                routeArrayByCanonicalUrlMap[ canonicalUrl ].push( route );
            }

            let canonicalUrlArray = Object.keys( routeArrayByCanonicalUrlMap );
            canonicalUrlArray.sort( ( a, b ) => a.localeCompare( b, undefined, { numeric: true, sensitivity: 'base' } ) );

            let routeArrayArray = [];

            for ( let canonicalUrlIndex = 0;
                  canonicalUrlIndex < canonicalUrlArray.length;
                  canonicalUrlIndex += this.maximumUrlCountPerFile )
            {
                routeArrayArray.push(
                    canonicalUrlArray.slice(
                        canonicalUrlIndex,
                        canonicalUrlIndex + this.maximumUrlCountPerFile
                        )
                    );
            }

            for ( let routeArrayIndex = 0;
                  routeArrayIndex < routeArrayArray.length;
                  ++routeArrayIndex )
            {
                let fileName = 'sitemap.xml';

                if ( routeArrayIndex > 0 )
                {
                    fileName = `sitemap_${ routeArrayIndex + 1 }.xml`;
                }

                rootSitemapFileArray.push(
                    {
                        subFolderPath,
                        fileName,
                        canonicalUrlArray : routeArrayArray[ routeArrayIndex ],
                        routeArrayByCanonicalUrlMap
                    }
                    );
            }
        }

        await this.writeRootSitemapFile( this.rootFolderPath, rootSitemapFileArray );
    }

    // -- OPERATIONS

    addRoute(
        routePattern,
        parameterByNameMap = {},
        subFolderPath,
        languageCode = undefined
        )
    {
        let changeFrequency = parameterByNameMap.changeFrequency ?? this.changeFrequency;
        let crawlPriority = parameterByNameMap.crawlPriority ?? this.crawlPriority;

        let route =
            new SitemapRoute(
                routePattern,
                { ...parameterByNameMap, changeFrequency, crawlPriority },
                subFolderPath,
                this.websiteUrl,
                languageCode
                );

        this.routeArray.push( route );
    }
}
