var webpack = require('webpack');
var path = require('path');
var HTMLWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var S3Plugin = require('webpack-s3-plugin');
var argv = require('yargs').argv;
var ExtractTextPlugin = require("extract-text-webpack-plugin");

let stage = argv.stage || "dev";

var config = require(`./config/${stage}.json`);

module.exports = {
    context: path.join(__dirname, 'src'),
    entry: {
        client: './js/web/client.js',
        'notify-sw': './js/service-worker/sw.js'
    },
    output: {
        path: './dist',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                include: [
                    path.join(__dirname, 'src', 'js'),
                    /sw-mini-libraries/,
                    path.join(__dirname, 'node_modules', 'google-analytics-protocol'),
                    path.join(__dirname, 'node_modules', 'service-worker-command-bridge'),
                    path.join(__dirname, 'node_modules', 'notification-commands')
                ],
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            },
             {
                test: /\.json$/,
                include: path.join(__dirname, 'src'),
                loaders: ['json-loader']
            },
            {
                test: /\images\/(.*)$/,
                loaders: ['file-loader']
            }
        ]
    },
    // resolve: {
    //     modulesDirectories: [path.join(__dirname, "node_modules")]
    // },
    // resolveLoader: {
    //     modulesDirectories: [path.join(__dirname, "node_modules")]
    // },
    plugins: [
        new HTMLWebpackPlugin({
            excludeChunks: ['notify-sw'],
            template: './html-template.ejs'
        }),
        
        new CopyWebpackPlugin([{
            from: 'static'
        }]),
        new webpack.DefinePlugin({
            "CLIENT_CONFIG": JSON.stringify(config.CLIENT_SAFE),
            "VERSION": JSON.stringify(Date.now()),
            "SERVICE_WORKER_PATH": JSON.stringify("/notify-sw.js")
        })
    ]
}

if (process.env.NODE_ENV === 'development') {
    
    //module.exports.plugins.push(new webpack.HotModuleReplacementPlugin());
    
    var hostnameToUse = 'http://localhost:8080';
    
    if (process.env.USE_NGROK) {
        
        // A little silly but webpack configs can't be run async, so we need
        // to de-async our ngrok host call.
        
        var deasync = require('deasync');
        var ngrok = require('ngrok');
        
        var ngrokSync = deasync(ngrok.connect);
        var hostnameToUse = ngrokSync({
            addr: 8080,
            subdomain: process.env.NGROK_SUBDOMAIN || ''
        });
    }
    
    module.exports.module.loaders.push({
        test: /\.scss$/,
        include: path.join(__dirname, 'src', 'scss'),
        loaders: ['style-loader', 'css-loader', 'sass-loader']
    });
    

    // Object.assign(module.exports.entry,{
    //   devClient: 'webpack-dev-server/client?' + hostnameToUse,
    //   devServer: 'webpack/hot/dev-server' 
    // })
    
    Object.assign(module.exports, {
        devtool: 'source-map',
        debug: true,
        devServer: {
             host: '0.0.0.0',
            //https: true,
            outputPath: './tmp'
        }
    })
}

if (process.env.NODE_ENV === 'production') {
    module.exports.plugins.push(new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production")}
    ));
    module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin());
    
    module.exports.module.loaders.push({
        test: /\.scss$/,
        include: path.join(__dirname, 'src', 'scss'),
        loader: ExtractTextPlugin.extract('style-loader', ['css-loader', 'sass-loader'])
    });
    
    module.exports.plugins.push(new ExtractTextPlugin(`styles.css?_${Date.now()}`));
    
    
}

if (process.env.WEBPACK_PUBLISH === 'true') {

    // set profile so aws-sdk can grab credentials
    
    module.exports.plugins.push(
      new S3Plugin({
        exclude: /notify-sw\.js/,
        s3Options: {
            region: 'us-east-1',
            accessKeyId: config.AWS_ACCESS_KEY_ID,
            secretAccessKey: config.AWS_SECRET_ACCESS_KEY
        },
        s3UploadOptions: {
            Bucket: config.AWS_BUCKET,
            ACL: config.AWS_ACL,
            CacheControl: 'max-age=60, no-transform, public'
        },
        basePath: config.AWS_ROOT_PATH
    }),
    new S3Plugin({
        include: /notify-sw\.js/,
        s3Options: {
            region: 'us-east-1',
            accessKeyId: config.AWS_ACCESS_KEY_ID,
            secretAccessKey: config.AWS_SECRET_ACCESS_KEY
        },
        s3UploadOptions: {
            Bucket: config.AWS_BUCKET,
            ACL: config.AWS_ACL,
            CacheControl: 'max-age=60, no-transform, public'
        }
    }))
}