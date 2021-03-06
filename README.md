# loluwin

[![Build Status](https://travis-ci.org/insanity54/loluwin.svg?branch=master)](https://travis-ci.org/insanity54/loluwin)

a web app for facilitating semi-automatic weekly giveaways


## server (admin) commands

### create a new giveaway

```
node luw.js create --help
```


## Todo




## Stack

NGINX load balancer
Node app run by Foreman inside Docker
  - web
  - db
  - clock
  - worker
CouchDB database


### SSL Cert

CA is [letsencrypt](https://letsencrypt.org) by the linux foundation

the way I generate SSL certs is to SSH into the web server

## Installing

This is rather complex, but here goes. This guide will show how to install loluwin on one host. (it is able to install on many hosts for scalability)

From your management machine, (get ansible up and running)[http://docs.ansible.com/].

first, cd to the ansible directory in this repo

$ cd util/ansible

Using Ansible, install other ansible roles (docker) needed.

$ ansible-galaxy install -r requirements.yml

Now run the provisioning playbook which will set up docker and the loluwin app code. This is what I have to run, but yours might be different.

$ ansible-playbook -u root -k --private-key=/Users/chris/.ssh/chris -i ./inventory provisioning/provision.yml



