# getty
This is a tiny web app that shows some of the high quality Getty images available via the Echo Nest API.

The images used in this demo are pre-retrieved using the ```build_it.py``` script. To run this script you will need an Echo Nest API key that allows access to the set of Getty Images.

Whe you run the script:

  % python build_it.py
  
It will generate the images.js that contains image information for the top hotttest artists. This images.js is used by the web app to populate the image gallery.