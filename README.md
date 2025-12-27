### API Service based on expressJs and redis cache

## installation
Clone the repository on a local folder and run docker compose:
```
docker compose up
```

## Operations

Use a browser and use  [open this page to test the API](http://localhost:5003/ui)
Use the drop down to select  a "bear" or a "dog" (only 2 animal types supported in this version) to fetch the photo of the animal you like.
press the 'Fetch Image' button and you will see the image display in the page.


The image is cached using a 30 seconds default TTL. If you press the  'Fetch Image' again during that time, the image is fetched from a Redis cache and the time to display is much faster. 

The REST API uses the following endpoint :
`/animals/fetch/<animal type>`

The default port for the local service is 5003 , that can be changed in the `.env` file

## Architecture 

2 Containers are used:

- A node container running an expressJs based web server for the UI and the animals rest client
- a redis server container that keeps the image on a cache during a specified TTL.    


