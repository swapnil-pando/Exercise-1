Feature: GET API.

    Scenario: Get the data in the array of objects format for the given filename

	    When i call the api with filename "input.json"
		Then i get the status 404
