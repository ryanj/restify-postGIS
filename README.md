# Map of National Parks and Historic Sites
*powered by RESTify, PostGIS, and Leaflet maps*

To deploy a clone of this application using the [`rhc` command line tool](http://rubygems.org/gems/rhc):

    rhc app create parks nodejs-0.10 postgresql-9.2 --from-code=https://github.com/ryanj/restify-postGIS.git
    
Or [link to a web-based clone+deploy](https://openshift.redhat.com/app/console/application_type/custom?cartridges%5B%5D=nodejs-0.10&cartridges%5B%5D=postgresql-9.2&initial_git_url=https%3A%2F%2Fgithub.com%2Fryanj%2Frestify-postGIS.git) on [OpenShift Online](http://OpenShift.com) or on [your own OpenShift cloud](http://openshift.github.io): 

    https://openshift.redhat.com/app/console/application_type/custom?cartridges%5B%5D=nodejs-0.10&cartridges%5B%5D=postgresql-9.2&initial_git_url=https%3A%2F%2Fgithub.com%2Fryanj%2Frestify-postGIS.git

A live demo is available at: [http://nodegis-shifter.rhcloud.com/](http://nodegis-shifter.rhcloud.com/)

## Local Development
Before you spin up a local server, you'll need a copy of the project source.  If created a copy of the application using the `rhc` command (above), then you should already have a local repo to work with.

If not, you can try cloning this repo, or using the `rhc git-clone` command to create a local copy of your OpenShift project's source.

Once our local project source is available, we'll need to install our application dependencies.  OpenShift will automatically install dependencies for all hosted applications.  You can manually install local dependencies from the command line using `npm`:

    npm install

### Local DB access
Feel free to set up your own local postgreSQL database for development (if needed).  However, OpenShift provides a great way to get connected to a hosted pg database in mere seconds.  The `rhc port-forward` can help you make the connection:

    rhc port-forward

The command output should look something like this:

    Checking available ports ... done
    Forwarding ports ...
    
    To connect to a service running on OpenShift, use the Local address
    
    Service    Local               OpenShift
    ---------- -------------- ---- ----------------
    node       127.0.0.1:8080  =>  127.5.199.1:8080
    postgresql 127.0.0.1:5433  =>  127.5.199.2:5432

    Press CTRL-C to terminate port forwarding

Note your **local** postgresql IP address and port number, and leave the command running in order to keep the connection open.  We will need these values (`127.0.0.1:5433` in the above example) in the next step.

### Environment variables
Next, take a look at our application's `config/defaults.json` settings file to see if any environment variables need to be defined:

    module.exports = {
      port: process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000,
      ip: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
      pg_config: process.env.OPENSHIFT_POSTGRESQL_DB_URL || 'postgresql://127.0.0.1:5432',
      table_name: process.env.OPENSHIFT_APP_NAME || 'nodegis'
    }

This application expects to use a Postgres `table_name` that matches your application's name (as defined within OpenShift).  When running this application on OpenShift, the `OPENSHIFT_APP_NAME` environment variable will be automatically populated.  

You can set the `OPENSHIFT_APP_NAME` environment variable in your local development environment to allow you application to connect to the correct database table:

    export OPENSHIFT_APP_NAME="nodegis"



`rhc app show nodegis`

     export OPENSHIFT_POSTGRESQL_DB_URL="postgres://admin32jk510:X_kgB-3LfUd3@127.0.0.1:5433

Now we can start our local webserver with:

    npm start

Access your local development server at: [localhost:3000](http://localhost:3000)

## Deploying updates to OpenShift

1. git add filename
2. git commit -m 'describe your change'
3. git push

## License
This code is dedicated to the public domain to the maximum extent permitted by applicable law, pursuant to CC0 (http://creativecommons.org/publicdomain/zero/1.0/)
