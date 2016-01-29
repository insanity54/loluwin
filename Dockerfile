FROM node:4-onbuild
MAINTAINER Chris Grimmett <chris@grimtech.net>
EXPOSE 3000

ENTRYPOINT ["npm"]
CMD ["start"]