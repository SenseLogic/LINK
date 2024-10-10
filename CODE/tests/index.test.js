// -- IMPORTS

import fs from 'fs';
import { jest } from '@jest/globals';
import { Sitemap } from '../index';

// -- STATEMENTS

jest.setTimeout( 30000 );

describe(
    'base',
    () =>
    {
        test(
            'SiteMap',
            async () =>
            {
                async function getLocationArray(
                    )
                {
                    return (
                        [
                            {
                                id : 'new-york',
                                name : 'New York',
                                districtArray :
                                    [
                                        {
                                            id : 'upper-east-side',
                                            name : 'Upper East Side',
                                            landmarkArray :
                                                [
                                                    { id : 'statue-of-liberty', name : 'Statue of Liberty' },
                                                    { id : 'central-park', name : 'Central Park' }
                                                ]
                                        },
                                        {
                                            id : 'harlem',
                                            name : 'Harlem',
                                            landmarkArray :
                                                [
                                                    { id : 'apollo-theater', name : 'Apollo Theater' }
                                                ]
                                        }
                                    ]
                            },
                            {
                                id : 'los-angeles',
                                name : 'Los Angeles',
                                districtArray :
                                    [
                                        {
                                            id : 'hollywood',
                                            name : 'Hollywood',
                                            landmarkArray :
                                                [
                                                    { id : 'griffith-observatory', name : 'Griffith Observatory' },
                                                    { id : 'hollywood-sign', name : 'Hollywood Sign' }
                                                ]
                                        },
                                        {
                                            id : 'downtown',
                                            name : 'Downtown',
                                            landmarkArray :
                                                [
                                                    { id : 'walt-disney-concert-hall', name : 'Walt Disney Concert Hall' }
                                                ]
                                        }
                                    ]
                            },
                            {
                                id : 'chicago',
                                name : 'Chicago',
                                districtArray :
                                    [
                                        {
                                            id : 'lincoln-park',
                                            name : 'Lincoln Park',
                                            landmarkArray :
                                                [
                                                    { id : 'lincoln-park-zoo', name : 'Lincoln Park Zoo' },
                                                    { id : 'chicago-history-museum', name : 'Chicago History Museum' }
                                                ]
                                        },
                                        {
                                            id : 'the-loop',
                                            name : 'The Loop',
                                            landmarkArray :
                                                [
                                                    { id : 'willis-tower', name : 'Willis Tower' },
                                                    { id : 'art-institute-of-chicago', name : 'Art Institute of Chicago' }
                                                ]
                                        }
                                    ]
                            }
                        ]
                        );
                }

                let cityArray = await getLocationArray();

                let sitemap =
                    new Sitemap(
                        {
                            websiteUrl : 'https://cityviews.com/',
                            changeFrequency : 'weekly',
                            crawlPriority : 0.8,
                            rootFolderPath : 'sitemap/',
                            maximumUrlCountPerFile : 3
                        }
                        );

                for ( let languageCode of [ 'en', 'fr', 'de' ] )
                {
                    sitemap.addRoute(
                        '{languageCode}/cities',
                        { languageCode },
                        'main/',
                        languageCode
                        );

                    for ( let city of cityArray )
                    {
                        sitemap.addRoute(
                            '{languageCode}/city/{cityId}',
                            { languageCode, cityId : city.id, crawlPriority : 0.7 },
                            'city/',
                            languageCode
                            );

                        for ( let district of city.districtArray )
                        {
                            sitemap.addRoute(
                                '{languageCode}/city/{cityId}/district/{districtId}',
                                { languageCode, cityId : city.id, districtId : district.id },
                                'district/',
                                languageCode
                                );

                            for ( let landmark of district.landmarkArray )
                            {
                                sitemap.addRoute(
                                    '{languageCode}/city/{cityId}/district/{districtId}/landmark/{landmarkId}',
                                    { languageCode, cityId : city.id, districtId : district.id, landmarkId : landmark.id, changeFrequency : 'daily', crawlPriority : 1.0 },
                                    'landmark/',
                                    languageCode
                                    );
                            }
                        }
                    }
                }

                await sitemap.writeSitemapFiles();

                let sitemapFileText = await fs.promises.readFile( './sitemap/sitemap.xml', 'utf8' );
                expect( sitemapFileText ).toContain( '<sitemapindex' );
                expect( sitemapFileText ).toContain( '<loc>https://cityviews.com/sitemap/main/sitemap.xml</loc>' );
                expect( sitemapFileText ).toContain( '<loc>https://cityviews.com/sitemap/city/sitemap.xml</loc>' );
                expect( sitemapFileText ).toContain( '<loc>https://cityviews.com/sitemap/district/sitemap.xml</loc>' );
                expect( sitemapFileText ).toContain( '<loc>https://cityviews.com/sitemap/district/sitemap_2.xml</loc>' );
                expect( sitemapFileText ).toContain( '<loc>https://cityviews.com/sitemap/landmark/sitemap.xml</loc>' );
                expect( sitemapFileText ).toContain( '<loc>https://cityviews.com/sitemap/landmark/sitemap_2.xml</loc>' );
                expect( sitemapFileText ).toContain( '<loc>https://cityviews.com/sitemap/landmark/sitemap_3.xml</loc>' );
                expect( sitemapFileText ).toContain( '<loc>https://cityviews.com/sitemap/landmark/sitemap_4.xml</loc>' );

                sitemapFileText = await fs.promises.readFile( './sitemap/main/sitemap.xml', 'utf8' );
                expect( sitemapFileText ).toContain( '<urlset' );
                expect( sitemapFileText ).toContain( '<loc>https://cityviews.com/cities</loc>' );

                sitemapFileText = await fs.promises.readFile( './sitemap/city/sitemap.xml', 'utf8' );
                expect( sitemapFileText ).toContain( '<urlset' );
                expect( sitemapFileText ).toContain( '<loc>https://cityviews.com/city/chicago</loc>' );
            }
            );
    }
    );
