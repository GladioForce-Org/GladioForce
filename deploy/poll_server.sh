#!/bin/bash

# Maximum retries and delay
MAX_RETRIES=60
DELAY=10

echo "Polling https://admin.gladioforce.org for readiness..."
for i in $(seq 1 $MAX_RETRIES); do
  response=$(curl -s -o /dev/null -w "%{http_code}" https://admin.gladioforce.org -k) # -k flag to ignore SSL certificate verification, needs to be removed in production
  echo "Attempt $i: HTTP Response Code - $response"

  if [ "$response" -eq 200 ]; then
    echo "https://admin.gladioforce.org is reachable. Server is ready!"
    exit 0  # Exit with status code 0 to indicate successful completion
  else
    echo "Server is not ready yet. Retrying in $DELAY seconds..."
    sleep $DELAY
  fi
done

# Final check to exit with proper status
echo "https://admin.gladioforce.org is not reachable after $((MAX_RETRIES * DELAY)) seconds. Exiting with error."
exit 1  # Exit with status code 1 to indicate failure if the server isn't reachable