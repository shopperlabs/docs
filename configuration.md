# Configuration
Shopper uses standard Laravel config files and environment variables for application-level settings

## Config Files
With the installation of Shopper you will find new configurations files located in `config/shopper/`. They are PHP files named by area of responsibility.

``` files theme:github-light
config/shopper/
    admin.php
    auth.php
    components.php
    core.php
    media.php
    models.php
    routes.php
    settings.php
```

And the `admin.php` is the main file, you can find various options to change the configuration of your Shopper installation.

## Admin and Core
All the basic configurations for using shopper can be found in this `admin.php` and `core.php` files. The admin prefix for route and the domain, the models to use and additional resources (scripts and styles) to the administration, user default role and permissions, etc.

### Brand logo
By default, the Shopper logo will be used as the brand logo in the administration panel.

To update it you just have to fill in the logo link in your public folder

```php
# config/shopper/admin.php

/*
  |--------------------------------------------------------------------------
  | Admin Brand Name
  |--------------------------------------------------------------------------
  |
  | This will be displayed on the login page and in the sidebar's header.
  |
  */

  'brand' => '/img/logo.svg',
```

### Controllers
By default Shopper loads controllers that are defined in this namespace. You can change it if you have a different structure. These controllers are used to extend and add functionalities in the administration.

In your config file you have the controllers key that define the controller's namespace for your extended Controllers:

``` php
# config/shopper/admin.php

'controllers' => [
    'namespace' => 'App\\Http\\Controllers\\Shopper',
],
```

### Models
Models used are defined in the models key, if you want to use your own models you can replace them on the `models.php` config file.

``` php
  'brand' => \Shopper\Core\Models\Brand::class,

  'category' => \Shopper\Core\Models\Category::class,

  'collection' => \Shopper\Core\Models\Collection::class,

  'product' => \Shopper\Core\Models\Product::class,
```

### Additional resources
During your work you may need to add your own style tables or javascript scenarios globally for all the pages, so you need to add them to relevant arrays.

```php
# config/shopper/admin.php

'resources' => [
    'stylesheets' => [
        //'css/custom.css',
    ],
    'scripts' => [
        //'js/custom.js',
    ],
],
```

## Routes
The configuration of the routes allows you to specify a prefix to access your dashboard, the addition of middleware and the configuration file to add more routes to your administration.

### Prefix
```php
# config/shopper/admin.php
'prefix' => env('SHOPPER_PREFIX', 'cpanel'),
```

The system installed on the website can be easily defined by the dashboard prefix, for example it is `wp-admin` for WordPress, and it gives an opportunity to automatically search for old vulnerable versions of software and gain control over it.

There are other reasons but we won't speak of them in this section. The point is that Shopper allows to change dashboard prefix to every other name, `admin` or `administrator` for example.

### Middleware

```php
# config/shopper/routes.php
'middleware' => [],
```

Shopper gives you the ability to add middleware to all of your routes. These middlewares will be applied to all the routes of your administration.

### Additional dashboard routes

```php
# config/shopper/routes.php
// Eg.: base_path('routes/shopper.php')
'custom_file' => null,
```

By default none of your routes in the `web.php` file will be accessible and loaded in the shopper administration. So that your routes added in the sidebar can have the middleware applied to the dashboard, you must fill in an additional routing file and this will be automatically loaded by Shopper's internal RouteServiceProvider.

## Components
The main features of Laravel Shopper is to handle Livewire components to add new functionnalities to your admin panel.

For this purpose you have a component file that lists all Livewire components used within Laravel Shopper. You can for each feature modify the associated or extends component to add functionality or even change the view to fit your own logic.

Here is an example of some components

```php
use Shopper\Http\Livewire\Components;

return [

    /*
    |--------------------------------------------------------------------------
    | Livewire Components
    |--------------------------------------------------------------------------
    |
    | Below you reference all the Livewire components that should be loaded
    | for your app. By default all components from Shopper Kit are loaded in.
    |
    */

    'livewire' => [
        'account.devices' => Components\Account\Devices::class,
        'account.dropdown' => Components\Account\Dropdown::class,
        'account.password' => Components\Account\Password::class,
    ],
];
```

## Settings
Settings are a very important part of an e-commerce site administration. Shopper has understood this very well and has set up a settings file, to allow you to add or modify the default settings of Shopper.

In this `settings.php` file under the shopper config folder, you can add parameters or delete those you don't need to simplify your store or to make it larger.

```php
return [
    /*
    |--------------------------------------------------------------------------
    | Setting Menu
    |--------------------------------------------------------------------------
    |
    | The menu for the generation of the page settings and layout.
    | BladeUIKit UntitledUI is the icon used. See https://blade-ui-kit.com/blade-icons?set=74
    |
    */

    'items' => [
        [
            'name' => 'General',
            'description' => 'View and update your store information.',
            'icon' => 'heroicon-o-cog',
            'route' => 'shopper.settings.shop',
            'permission' => null,
        ],
        [
            'name' => 'Staff & permissions',
            'description' => 'View and manage what staff can see or do in your store.',
            'icon' => 'heroicon-o-users',
            'route' => 'shopper.settings.users',
            'permission' => null,
        ],
    ],
];
```

## Mapbox
Shopper uses Mapbox to enter the geographic coordinates (latitude and longitude) of your store so that you can easily tell your customers your location.

:::info
This configuration is absolutely not required to launch shopper, so don't worry.
:::

To activate mapbox you need to go to the [API](https://docs.mapbox.com/mapbox-gl-js/api/) documentation and create an API token. Once this is done you need to add the key `MAPBOX_PUBLIC_TOKEN` with the token value to your `.env` file

```bash
MAPBOX_PUBLIC_TOKEN=your_token_here
```

## Upload Configuration
By default, shopper uses the public disk to upload images. But if you want to use another disk, for example an uploads disk, in your `config/filesystems.php` config file add the following to the disks and links section:

``` php
'disks' => [
    // Shopper Uploads Disks. [tl! highlight:6]
    'uploads' => [
        'driver' => 'local',
        'root' => storage_path('app/uploads'),
        'url' => env('APP_URL').'/uploads',
        'visibility' => 'public',
    ],
],

/*
|--------------------------------------------------------------------------
| Symbolic Links
|--------------------------------------------------------------------------
|
| Here you may configure the symbolic links that will be created when the
| `storage:link` Artisan command is executed. The array keys should be
| the locations of the links and the values should be their targets.
|
*/

'links' => [
    public_path('uploads') => storage_path('app/uploads'),  // [tl! highlight]
],
```

Once you have done this, you need to change the name of the disk to be used in the `shopper/core.php` config file to apply the changes.

```php
/*
|--------------------------------------------------------------------------
| Storage Disk
|--------------------------------------------------------------------------
|
| Specifies the configuration for resources storage, this will be to store
| all media of your products, brands, categories, etc.
|
*/

'storage' => [
    'collection_name' => 'uploads',
    'disk_name' => 'public', // [tl! --]
    'disk_name' => 'uploads', // [tl! ++]
],
```

### Create New Folder
After adding the entry in the filesystem config file, you must create and add this to the .gitignore file. In your storage directory, create a new folder called `uploads`.

```bash
mkdir storage/app/uploads
```

In the new folder that you have created **(uploads)** you must create a .gitignore file which will contain the following line

```bash
*
!.gitignore
```
