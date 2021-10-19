# simple-redis-cache
An simple example of redis caching in nodejs

----
BASE_URL_ALL_REPOS : `https://api.github.com/users/:username`
### `GET /repos/:username`


BASE_URL_SINGLE_REPO : `https://api.github.com/repos/:username/:name`
### `GET /repos/:username`


### Example caching times
 Before caching time : `~180ms`

 After caching time : `~3ms`

 You can also try on `rest.http` file and learn caching times. Just switch parameters with yours infos and try!
