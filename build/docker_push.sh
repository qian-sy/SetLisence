#!/bin/bash
branch=$1
if [ $branch = "master" ]
then
  docker push qiansy/lisence:master
fi