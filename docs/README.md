# IBM Cloud PaaS Lab

This lab will introduce the steps to deploy a cloud native application that integrates with a database. In this scenario, we will be deploying a sample guestbook application, built using nodejs, that integrates with a Mongo database.

## GitHub Repository
The application code and Dockerfile can be found here in the [nodejs-guestbook](https://github.com/mcltn/nodejs-guestbook) project repository.

## Pre-requisites
We will be using a mix of the IBM Cloud control panel and the IBM Cloud CLI. You will need to make certain you have access to an account where you have provisioning capabilities as well as the IBM Cloud CLI installed on your workstation.

Install the IBM Cloud CLI if you do not already have it.
[IBM Cloud CLI](https://cloud.ibm.com/docs/cli?topic=cli-getting-started)

Confirm that you have the code-engine plugin installed for your IBM Cloud CLI, and install the plugin if you do not.
```bash
ibmcloud plugin show code-engine

ibmcloud plugin install code-engine
```

## Overview

The first step will be to create a IBM Cloud Databases for MongoDB instance. Then you will deploy the application using IBM Cloud Code Engine. Last you can then alternatively deploy the application using IBM Cloud Kubernetes service or IBM Cloud Red Hat OpenShift.

## IBM Cloud Databases

Let's create a IBM Cloud Databases for MongoDB instance. You will navigate to the IBM Cloud catalog and select IBM Cloud Databases for MongoDB.

![ICD MongoDB Catalog](catalog-icd-mongo.png)

Once you select Databases for MongoDB from the catalog, you will see the order screen for Databases for MongoDB.

- First name your instance by filling out the **Service** name field
- Next select the **Resource Group**
- Now choose a **Location**
- Next, before setting **Resource Allocation**, change the **Database Edition** to **Standard**
- Now you will choose to modify the **Resource Allocation** by selecting the **Custom** tab and setting the values to the minimum, as shown in the screenshot below.
- All other values should be able to be set as default values, but be certain you have your **Endpoints** set as **Public network**

![ICD MongoDB Order](icd-mongo-order.png)

Now click **Create**

Provisioning of the service will take approximately 20 minutes. Grab a coffee and check back soon to continue....

![ICD MongoDB Order](mongo-provisioning.png)

Once your MongoDB service status has changed to **Active**, you can now click the row and go to the MongoDB instance detail screen.

In order for the application that we deploy later to interact with the MongoDB instance, you will need to create credentials. Click on **Service Credentials** in the left menu. Next click **New Credential** and provide a name for the new credential you will create. Click **Add** to create.

![ICD MongoDB Credential](new-credential.png)

From the credential, we will want to collect three main variables to use for the application. Expand the credential to see the values. Look for the **composed** section and collect the **username** and **password** as well as the **hosts**. Be sure to save the full hostname and port for each, you **do not** need the replset/ part.

![ICD MongoDB Credentials](mongo-credentials-save.png)

Go back to the main detail page of your service by clicking **Overview** on the left navigation. Next, scroll down and look for the **Endpoints** section. Here you will need to save the TLS Certificate information. You can do this by copying the text, or by downloading the certificate by clicking **Download Certificate**. We will save this to a local file to be used when deploying the application. The filename for this will be **cert.pem**.

![ICD MongoDB Credentials](mongo-tls-cert.png)

This concludes the **IBM Cloud Databases for MongoDB** portion of the lab. You should now have a database instance running and credentials to be used for connecting an application.


## IBM Cloud Code Engine
In this portion of the lab you will deploy an application from a GitHub repository to **IBM Cloud Code Engine**. These steps will be performed via the **IBM CLI**. Please make certain you have the CLI installed and have the appropriate plugins added, in this case, the code engine plugin. This application has a dependency on a Mongo database (which you should already have deployed) and has required environment variables. Before being able to create the application within Code Engine, we will need to define the values for the variables by setting up a few local environment variables that will get passed into the CLI command for creating the application. You should have this information from the **IBM Cloud Databases** section of this lab above.

```bash
export MONGO_DB_USERNAME=<YOUR_DB_USERNAME>
export MONGO_DB_PASSWORD=<YOUR_DB_PASSWORD>
export MONGO_DB_REPLICASET=<YOUR_DB_REPLICASET>
export APIKEY=<YOUR_IBM_CLOUD_APIKEY>
```


### Clone the application repository
You will start by cloning the repositiory to work with the files locally.

```bash
git clone https://github.com/mcltn/nodejs-guestbook
cd nodejs-guestbook/
```

### Login to your account
If you do not have an API key defined for your account, you can create one in the IBM Cloud Control Panel by following the instructions here.
[Creating an API Key](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui#create_user_key)

```bash
ibmcloud login --apikey ${APIKEY} -r <region> -g <resource-group>
```

### Create a project
Create a **Code Engine** project to host the components for your application. A project is a grouping of **Code Engine** entities such as applications, jobs, and builds. A project is based on a Kubernetes namespace. The name of your project must be unique within your **IBM Cloud®** resource group, user account, and region. Projects are used to manage resources and provide access to its entities.

```bash
ibmcloud ce project create --name guestbook-lab
```
![CE Create Project](ce-create-project.png)

By default, the CLI will target the project, however, if you already had a project of the same name or coming back to this step later, you may need to select the project to continue the steps further.

```bash
ibmcloud ce project select --name guestbook-lab
```

Check if you currently have a container registry access secret defined for the project scope. This is used to interact with the container registry. You will not need to define a namespace as one will automatically be generated by Code Engine for use.
```bash
ibmcloud ce registry list
```

If you do not have a container registry access secret already defined, you can create a new container registry access secret using the command below.
```bash
ibmcloud ce registry create --name myregistry --server us.icr.io --username iamapikey --password ${APIKEY}
```


### Create Secret
Now that you have a project, you will create a **Secret** to store the **cert.pem** file contents which will be mounted to the application as a volume. Copy the cert.pem file you created previously in the **IBM Cloud Database** portion of the lab, or create a new cert.pem file with the **TLS Certificate** as contents into this directory. Next, create the secret.

```bash
ibmcloud ce secret create --name guestbook-lab --from-file cert.pem
```
![CE Create Secret](ce-create-secret.png)

### Create App
Now you are ready to create your application. This step will create a new application using the contents from the Dockerfile of the project to build the application and deploy. We will set the minimum scale of the application to **1** so we always have a single instance running, however you can set this to **0** if you wish.

```bash
ibmcloud ce app create --name guestbook-lab --build-source . \
--strategy dockerfile \
--minscale 1 \
--mount-secret /secrets=guestbook-lab \
--env DBUSERNAME=${MONGO_DB_USERNAME} \
--env DBPASSWORD=${MONGO_DB_PASSWORD} \
--env DBNAME=guestbook \
--env DBREPLICASET=${MONGO_DB_REPLICASET} \
--env CERTFILE=/secrets/cert.pem
```
You should now see a **URL** presented to you in the output in which you can navigate to in your browser and see the application running.

![CE Create App](ce-create-app.png)


## IBM Cloud Red Hat OpenShift
In this portion of the lab you will deploy the same application you may have previosuly deployed to **IBM Cloud Code Engine**. Make certain you have gotten the latest updates to the repository as they now contain the Kubernetes deployment folder, or additional updates. This lab will be completed using a **Red Hat OpenShift on IBM Cloud** cluster, so make certain you have a working cluster. Also, this application has a dependency on having a MongoDB instance. You can reuse the database created previously in this lab, or recreate by using the same steps above.

If you need instructions on creating a **Red Hat OpenShift on IBM Cloud** cluster, follow the steps in the console. You should only need a Single Zone Cluster with minimal profile size and worker nodes.

[Create a Red Hat OpenShift on IBM Cloud cluster](https://cloud.ibm.com/kubernetes/catalog/create?platformType=openshift)

To begin, login to your Red Hat OpenShift Container Plateform Console by clicking the **OpenShift web console** button in the IBM Cloud console from your deployed instance.

![IBM Cloud console](openshift-cluster-detail-button.png)

### Create OpenShift Project
The first thing we need to do before deploying an application, is to create a **Project** within **OpenShift**. To do this, make certain you are in the **Administrator** view, and select **Projects** from the left navigation under **Home**. Click the **Create Project** button.

![Create Project](openshift-create-project-button.png)

Add a name for your project. Through this lab we used **guestbook-lab** for the project name. You can use whatever name you wish, just be sure to replace all instances in the future with your project name. In the YAML files you will replace **namespace** with your **project name**.

![Create Project](openshift-create-project-window.png)

### Create OpenShift Secrets
For the application to communicate to the database, it will need environment variables defined, in which we will store in a **Kubernetes Secret**. We will also store the **IBM Cloud Databases for MongoDB** TLS certificate in a **Kubernetes Secret**.

In the left navigation of your OpenShift console, select **Workloads** and click **Secrets**.

![Workloads Navigation](openshift-navigation.png)

Next, click the **Create** drop down button and select **From YAML**.

![Create Secret](openshift-create-secret-dropdown.png)

From the application repository, copy the contents from the [icd-secrets.yaml.template](https://raw.githubusercontent.com/mcltn/nodejs-guestbook/main/deployment/icd-secrets.yaml.template) file located in the deployment folder. Paste these contents in the window and replace the **{{PLACEHOLDERS}}** with the values for your namespace and ICD MongoDB. Next click **Create**.

![Create Secret for Database Credentials](openshift-create-icd-secret.png)

Just like the step above, now copy the contents from the [icd-cert.yaml.template](https://raw.githubusercontent.com/mcltn/nodejs-guestbook/main/deployment/icd-cert.yaml.template) file located in the deployment folder. Paste these contents in the window and replace the **{{CERTIFICATE}}** placeholder with the value of your ICD MongoDB TLS Certificate. Next click **Create**.

![Create Secret for TLS Cert](openshift-create-cert-secret.png)

Next confirm the two new **Secrets** have bene created. The **icd-cert** secret should have 1 item, and the **icd-secrets** secret should have 5 items.

![Secret Confirmation](openshift-secrets-confirmation.png)

### Create OpenShift Deployment

Now we will create a **Deployment**. In the left navigation, click **Deployments** under the **Workloads** section. You should see that there are no deployments found for this **Project**. Click the **Create Deployment** button.

![Create Deployment](openshift-create-deployment-button.png)

From the application repository, copy the contents from the [deployment.yaml](https://raw.githubusercontent.com/mcltn/nodejs-guestbook/main/deployment/deployment.yaml) file located in the deployment folder. Paste these contents in the window. You should not need to make any modifications to these contents. Then click **Create**.

![Create Deployment](openshift-create-deployment.png)

You should now see a **Deployment details** screen for your deployment. Wait for the application to be deployed. 

![Deployment detail](openshift-deployment-detail.png)

You can view the status of the pod by clicking the **Pods** tab and verify you have a single pod with a status of **Running**. This may take just a few seconds, but you have deployed an application! 

![Deployment Pod detail](openshift-deployment-pod.png)

Though we have a running application, we can not yet reach the application because we have not **exposed** a service. We will next create a **Service**.

### Create OpenShift Service
To create a **Service**, you will need to select the **Networking** section in the left navigation and click **Services**. You should see that there are no services created. Click **Create Service**.

![Create Service](openshift-create-service-button.png)

From the application repository, copy the contents from the [service.yaml](https://raw.githubusercontent.com/mcltn/nodejs-guestbook/main/deployment/service.yaml) file located in the deployment folder. Paste these contents in the window. Replace the {{NAMESPACE}} placeholder with your project/namespace name. Then click **Create**.

![Create Service](openshift-create-service.png)

You will now have a **Service** created for your application. Verify that the **Pod selector** is correct and that you have a Cluster IP. You will notice that this application still can only be accessible from within the cluster.  

![Create Service](openshift-create-service-detail.png)


### Create OpenShift Route
We will need to now create a **Route** to expose the application to the public. We will use the console to enter the parameters which we want for the **Route**. Alternatively, in the repository, there is a **route.yaml** file that can be used as well.

Enter a **Name** for the route (ie: guestbook-lab). You can leave **Hostname** empty as well as leave **Path** as it is.

Select **nodejs-guestbook** as the **Service** and select **8080 -> 8080 (TCP)** as the **Target port**.

Click **Create**.

![Create Route UI](openshift-create-route.png)

Now you should have a created **Route**. Try accessing the application by clicking the **URL** in the **Location** section.

![Create Route](openshift-route-detail.png)

You should now see the **Sample Guestbook Application**. Verify that the application works by adding an entry into the **Guestbook**.

![Guestbook UI](openshift-guestbook-web.png)

### Delete Project
You can remove the application and components that you created, simply by **deleting** the project. Navigate to the **Home** section of the left navigation and select ***Projects**. Select the **guestbook-lab** project (or name of project you created) and form the **Actions** menu on the **Project details** screen, click **Delete Project**. You will need to enter the name of the project for confirmation.

![Delete Project](openshift-delete-project.png)

Congratulations! You have completed the **OpenShift** portion of the lab.

