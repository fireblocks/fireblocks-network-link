#!/bin/bash

TIMES=$1

for i in $(eval echo "{1..$TIMES}")
do
   npm run server > /dev/null 2>&1 &
   npm run test

   if [ $? -eq 0 ]; then
     killall node
   else
     break
   fi
done
