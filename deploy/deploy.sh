#!/bin/bash

git clone git@github.com:H4sh3/hex.git /opt/repo/short-url
cd /opt/ansible/
ansible-playbook -i inventories/prod playbooks/deploy.yml
rm -rf /opt/repo