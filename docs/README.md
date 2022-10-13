# IBM Cloud PaaS Lab

This lab will introduce the steps to deploy a cloud native application that integrates with a database. In this scenario, we will be deploying a sample guestbook application, built using nodejs, that integrates with a Mongo database.

## Pre-requisites
We will be using a mix of the IBM Cloud control panel and the IBM Cloud CLI. You will need to make certain you have access to an account where you have provisioning capabilities as well as the IBM Cloud CLI installed on your workstation.

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

## IBM Cloud OpenShift
