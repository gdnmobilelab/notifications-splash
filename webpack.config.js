var webpack = require('webpack');
var path = require('path');
var HTMLWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var S3Plugin = require('webpack-s3-plugin');
var CompressionPlugin = require('compression-webpack-plugin');

var config = require('./config/dev.json');

module.exports = {
    context: path.join(__dirname, 'src'),
    entry: {
        client: './js/web/client.js',
        sw: './js/service-worker/sw.js',
        css: './scss/main.scss'
    },
    output: {
        path: './dist',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                include: path.join(__dirname, 'src', 'js'),
                loader: 'babel-loader'
            },
            {
                test: /\.scss$/,
                include: path.join(__dirname, 'src', 'scss'),
                loaders: ['style-loader', 'css-loader', 'sass-loader']
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
    plugins: [
        new HTMLWebpackPlugin({
            excludeChunks: ['sw'],
            template: './html-template.ejs'
        }),
        
        new CopyWebpackPlugin([{
            from: 'static'
        }]),
        new webpack.DefinePlugin({
            "CLIENT_CONFIG": JSON.stringify(config.CLIENT_SAFE),
            "ANALYTICS_ID": JSON.stringify("UA-77348538-2")
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
    
    console.log(hostnameToUse) 
    
   
    
    Object.assign(module.exports.entry,{
      devClient: 'webpack-dev-server/client?' + hostnameToUse,
      devServer: 'webpack/hot/dev-server' 
    })
    
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
}

if (process.env.WEBPACK_PUBLISH === 'true') {
    
    

    module.exports.plugins.push(
        //new CompressionPlugin({asset: '{file}'}),
        new S3Plugin({
        
        s3Options: {
            accessKeyId: config.AWS_ACCESS_KEY_ID,
            secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
            region: 'us-east-1'
        },
        s3UploadOptions: {
            Bucket: config.AWS_BUCKET,
            ACL: 'private',
            CacheControl: 'max-age=60, no-transform, public'/*,
            ContentEncoding: 'gzip'*/
        },
        basePath: 'dev-apps/notification-demo'
    }))
}