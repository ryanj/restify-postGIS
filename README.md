# National Parks and Historic Sites
*powered by RESTify, PostGIS, and Leaflet maps*

## Hosting on OpenShift
To deploy a clone of this application using the [`rhc` command line tool](http://rubygems.org/gems/rhc), type:

    rhc app create parks nodejs-0.10 postgresql-9.2 --from-code=https://github.com/ryanj/restify-postGIS.git
    
Or, [link to a web-based **clone+deploy**](https://openshift.redhat.com/app/console/application_type/custom?name=parks&cartridges%5B%5D=nodejs-0.10&cartridges%5B%5D=postgresql-9.2&initial_git_url=https%3A%2F%2Fgithub.com%2Fryanj%2Frestify-postGIS.git) on [OpenShift Online](http://OpenShift.com) or [your own open cloud](http://openshift.github.io): 

    https://openshift.redhat.com/app/console/application_type/custom?name=parks&cartridges%5B%5D=nodejs-0.10&cartridges%5B%5D=postgresql-9.2&initial_git_url=https%3A%2F%2Fgithub.com%2Fryanj%2Frestify-postGIS.git

A live demo is available at: [http://nodegis-shifter.rhcloud.com/](http://nodegis-shifter.rhcloud.com/)

### Local Development
Before you spin up a local server, you'll need a copy of the source code.

If you created a clone of the application using the `rhc` command (above), then you should already have a local copy of the source code available.  If not, you can try cloning the repo using `git`, or take advantage of the `rhc git-clone` command to create a local copy of your project source.

    rhc git-clone parks

OpenShift will automatically resolve `package.json` dependencies for hosted applications using an automated build process.  In your local development environment, you'll need to run `npm install` to make sure that your application's package dependencies have been made available:

    npm install

### Local DB access
You can set up your own postgreSQL database for local development.  But, OpenShift provides a great way to get connected to your hosted database in mere seconds.  

The `rhc port-forward` command can help you set up a local connection to your remote DB, where your DB permissions, table schema, and map data have already been initialized.  The command output will provide your local connection details:

    Service    Local               OpenShift
    ---------- -------------- ---- ----------------
    node       127.0.0.1:8080  =>  127.5.199.1:8080
    postgresql 127.0.0.1:5433  =>  127.5.199.2:5432

    Press CTRL-C to terminate port forwarding

Make a note of the local postgresql IP address and port number, and leave the command running in order to keep the connection open.  We will need to use these values ("`127.0.0.1:5433`" in the above example) in the next step.

### Configuration with environment variables
This app uses the `config` npm module, which loads it's configuration details from `config/defaults.json`.  Inside this file, we can see that the app is configured to take advantage of several environment variables (whenever they are available):

    module.exports = {
      port: process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000,
      ip: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
      pg_config: process.env.OPENSHIFT_POSTGRESQL_DB_URL || 'postgresql://127.0.0.1:5432',
      table_name: process.env.OPENSHIFT_APP_NAME || 'parks'
    }

Sensible defaults allow us to run the same code in multiple environments. If you plan on using the port-forwarded DB connection from the [previous step](#local-db-access), you'll need to supply some additional DB authentication credentials via the `OPENSHIFT_POSTGRESQL_DB_URL` environment variable. 

These additional access keys are printed out as your application is created.  You can also access them by running the `rhc app show` command.

    rhc app show parks

Now, set your `OPENSHIFT_POSTGRESQL_DB_URL` environment variable, substituting your own `DB_USERNAME`, `DB_PASSWORD`, `LOCAL_DB_IP`, and `LOCAL_DB_PORT`:

    export OPENSHIFT_POSTGRESQL_DB_URL="postgres://DB_USERNAME:DB_PASSWORD@LOCAL_DB_IP:LOCAL_DB_PORT

Mine looks like this:

    export OPENSHIFT_POSTGRESQL_DB_URL="postgres://admin32jk510:X_kgB-3LfUd3@127.0.0.1:5433

This application also expects to use a Postgres `table_name` that matches your application's name (as defined within OpenShift).  When running this application on OpenShift, the `OPENSHIFT_APP_NAME` environment variable will be automatically populated.  If you didn't name your application "parks" (the default value for this option), then you will likely need to set an extra environment variable in your local development environment:

    export OPENSHIFT_APP_NAME=parks

Start your local webserver with:

    npm start

Your local development server should be available at the default address: [localhost:3000](http://localhost:3000)

## Deploying updates to OpenShift
When you're ready, push changes to your OpenShift-hosted application environment using a standard `git` workflow:

1. Add your changes to a changeset:

    git add filename

2. Mark the changeset as a Commit

    git commit -m 'describe your change'

3. Push the Commit to OpenShift

    git push

## License
This code is dedicated to the public domain to the maximum extent permitted by applicable law, pursuant to CC0 (http://creativecommons.org/publicdomain/zero/1.0/)
