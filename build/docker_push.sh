branch=$1
if [ $branch = "master" ]
then
  docker push qiansy/lisence:dev-latest
fi