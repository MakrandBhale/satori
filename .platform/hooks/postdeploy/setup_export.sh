#!/usr/bin/env bash
export PYTHONPATH=/var/app/venv/staging-LQM1lest/bin:/var/app/current
echo $PYTHONPATH
/etc/init.d/supervisord restart
systemctl status supervisord.service -l
