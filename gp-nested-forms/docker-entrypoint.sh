#!/bin/bash

# Allows WP CLI to run with the right permissions.
wp-su() {
	sudo -E -u www-data wp "$@"
}

# Clean up from previous tests
rm -rf /wp-core/wp-content/plugins/gravityforms
rm -rf /wp-core/wp-content/upgrade

cd /wp-core || exit 1

# Make directories
mkdir -p wp-content/uploads
mkdir -p wp-content/upgrade

# Make sure permissions are correct.
chown www-data:www-data wp-content/plugins
chmod 755 wp-content/plugins

chown www-data:www-data wp-content/uploads
chmod 755 wp-content/uploads

chown www-data:www-data wp-content/upgrade
chmod 755 wp-content/upgrade

export WP_CLI_CACHE_DIR=/wp-core/.wp-cli/cache

# Make sure the database is up and running
while ! mysqladmin ping -hmysql --silent; do
	echo 'Waiting for the database'
	sleep 1
done

echo 'The database is ready'

# Make sure WordPress is installed.
if ! $(wp-su core is-installed); then

	echo "Installing WordPress"

	wp-su core install --url=wordpress --title=tests --admin_user=admin --admin_email=test@test.com

	# Enable SCRIPT_DEBUG
	wp-su core config --dbhost=mysql --dbname=wordpress --dbuser=root --dbpass=wordpress --extra-php="define( 'SCRIPT_DEBUG', true );" --force

fi


if [ -z ${GITHUB_TOKEN} ]; then

	echo "Installing the latest version of Gravity Forms using the CLI"

	wp-su plugin install gravityformscli --force --activate
	wp-su gf install --key=${GF_KEY} --activate --force
	echo "Gravity Forms installation complete"

  echo "Installing Partial Entries add-on"
  wp-su gf install gravityformspartialentries --key=${GF_KEY} --activate --quiet --force
	echo "Gravity Forms Partial Entries installation complete"

	wp-su gf tool verify-checksums

else

	rm -rf /wp-core/wp-content/plugins/gravityforms

	echo "Grabbing the latest development master of Gravity Forms"

	git clone -b master --single-branch https://$GITHUB_TOKEN@github.com/gravityforms/gravityforms.git /wp-core/wp-content/plugins/gravityforms

fi

cd /project

exec "/repo/vendor/bin/codecept" "$@"
