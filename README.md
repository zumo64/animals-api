### API Service based on expressJs and redis cache

## installation
Clone the repository on a local folder and run docker compose:
```
docker compose up
```
## Operations

Use a browser and use  [open this page to test the API](http://localhost:5003/ui)
in the input field enter "bear" or "dog" (only 2 animal types supported in this version) to fetch the photo of the animal you like
press the 'Fetch Image' button and you will see the image display in the page

The image is cached using a 2minutes TTL. If you press the  'Fetch Image' again during that time, the image is fetched from the cache.


The REST API uses the following endpoint :
`/animals/fetch/<animal type>`

The default port is 5003 , that can be changed in the `.env` file


