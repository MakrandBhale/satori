## A file describing gotchas of hosting the app on AWS.

#to run RQ worker after deployment we used supervisord. All other options failed like using services or postdeploy script


#the supervisord script is in following directory
/etc/init.d

#to execute supervisord manually, cd into above directory and run:
./supervisord restart

should give 'OK' two times if everything is working

#to check worker logs use following command:
supervisorctl tail -5000 myworker:myworker-0 stderr

#and stout can also be used like this:
supervisorctl tail -5000 myworker:myworker-0 stderr

# to check status if supervisor is running or not use:
systemctl status supervisord.service -l

# supervisor logs are in following directory:
/tmp
    # supervisor log name : supervisord.log
    # supervisor pid name : supervisord.pid

# Common logs
    Common logs are situated at /var/log/
    Main log files are as follows: 
        # cfn-init.log
        # eb-hooks.log
        # eb-cfn-init.log

# APP folder: 
/var/app/current

# venv folder:
/var/app/venv/staging-LQM1lest/bin

# To upgrade redis
look in the .ebextensions folder, edit redis_setup.config