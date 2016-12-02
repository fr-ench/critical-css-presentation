'use strict';

import webpack              from 'webpack';
import yargs                from 'yargs';
import path                 from 'path';

import ExtractTextPlugin    from 'extract-text-webpack-plugin';
import Clean                from 'clean-webpack-plugin';

import autoprefixer         from 'autoprefixer';
import postcssFlexbugsFixes from 'postcss-flexbugs-fixes';
import postcssInitial       from 'postcss-initial';

const isDevServer   = process.argv[1].indexOf('webpack-dev-server') >= 0;
const isDevelopment = yargs.argv.live ? false : (yargs.argv.dev ? true : process.env.NODE_ENV != "production");

console.log(isDevelopment ? 'development' : 'production');
console.log('NODE_ENV = ' + process.env.NODE_ENV);


export default {
    entry: (function () {
        let arr = [];
        if (isDevServer) {
            arr.push('webpack-dev-server/client?http://localhost:8080');
            arr.push('webpack/hot/dev-server');
        }

        let entrypoints = {
            'app': ["babel-polyfill", "app"].concat(arr)
        };

        return entrypoints;
    })(),
    output : {
        path       : path.resolve(__dirname + "/dist"),
        publicPath : "",
        filename      : "[name].js",
        chunkFilename : "[name].[chunkhash].js"
    },
    resolve : {
        extensions         : ["", ".js", ".min.js", ".custom.js"],
        modulesDirectories : [
			"app",
			"app/components",
			"app/general/svg",
			"app/general/less",
			"app/general/less/modules",
			"app/general/less/settings",
			"app/general/js",
			"app/general/fonts",
			"app/general/img",
            "templates",
            "node_modules",
            "web_modules"
        ],
        alias: {
            'jquery': 'jquery.min',
            'TweenLite': 'gsap/src/uncompressed/TweenLite',
            'ScrollToPlugin': 'gsap/src/uncompressed/plugins/ScrollToPlugin'
        }
    },
    devtool : (isDevelopment || isDevServer) ? "cheap-source-map" : "source-map",
    module : {
        loaders : [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'es2015-loose'],
                    plugins: [
                        'transform-object-assign'
                    ]
                }
            },
			{
			    test: /\.(svg|png|jpg|jpeg|eot|ttf|woff|woff2|gif)$/i,
                exclude: /(svg|defs)[\/\\]/,
			    loader  : 'url-loader?limit=10000'
			},
			{
			    test   : /\.css$/,
			    loader : (
					isDevServer ? "style!css?-minimize!postcss" : ExtractTextPlugin.extract('style', 'css!postcss', { allChunks: false })
				)
			},
			{
			    test   : /\.less$/,
			    loader : (
					isDevServer ? "style!css?-minimize!postcss!less" : ExtractTextPlugin.extract('style', 'css?-minimize!postcss?!less?-compress', { allChunks: false })
				)
			},
            {
                test: /\.svg$/,
                include: /svg[\/\\]/,
                loader: 'svg-sprite?' + JSON.stringify({
                    name: 'icon-' + '[name]',
                    prefixize: true
                })
            }
        ]
    },

    postcss: function () {
        let postPlugins = [
            postcssInitial({
                reset: 'inherited'
            }),
            autoprefixer({ browsers: ["last 3 versions", "ie 10"] }),
            postcssFlexbugsFixes()
        ];

        return postPlugins;
    },

    svgoConfig: {
        plugins:
        [
            {
                cleanupIDs: false,
                removeHiddenElems: false
            }
        ]
    },

    plugins : (function () {
        let plugs = isDevServer ? [new webpack.HotModuleReplacementPlugin()] : [new Clean(["dist"])];

        if (!isDevServer){
            plugs.push(
                new ExtractTextPlugin("[name].css")
            );
        }

        plugs.push(
			new webpack.DefinePlugin({
				    NODE_ENV    : isDevelopment ? "'development'" : "'production'"
			}),
			new webpack.NoErrorsPlugin()
		);


    if (!isDevelopment){
        plugs.push(
				new webpack.optimize.UglifyJsPlugin({
				    compress : {
				        warnings     : false,
				        drop_console : false,
				        unsafe       : true
				    },
                    output: {
                        comments: false,
                    }
				})
			);
        }

        return plugs;
    })(),

    stats: {
      children: false
    },

    devServer : {
        //quiet: true,
        //noInfo: true,
        proxy: { "*": "http://localhost:1299" },
        headers : {
            "Access-Control-Allow-Origin"      : "http://localhost:1299",
            "Access-Control-Allow-Credentials" : 'true'
        },
        hot     : true,
        stats: {
          children: false
        }
    }
};
