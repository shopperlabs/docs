# Channels
In today's E-commerce the shop site is no longer the only point of sale.

## Overview
Channels represent a single sales channel, which can be one of the following things:

- Website
- Mobile application
- Cashier in your physical store
- Facebook shop,
- Instagram shop
- Telegram
- WhatsApp
- etc

### Fields
The model used is `Shopper\Core\Models\Channel`.

| Name        | Type      | Required   |  Notes   |
|-------------|-----------|------------|------------|
| `id`  | autoinc |         |  auto  |
| `name`    | string  | yes |   |
| `slug`    | string  | yes | Unique, default value is auto generated using channel's name |
| `url` | string  | no | Nullable |
| `description` | longText  | no | Nullable |
| `timezone` | string  | no | Default `null` |
| `is_default` | boolean  | no | Default `false` |

:::tip
Models are customizable, and we recommend changing the **Channel** model when you configure your site. To change the model you need to look at the configuration file `config/shopper/models.php`.
:::

```php
return [
  'models' => [
    'channel' => \Shopper\Core\Models\Channel::class,
  ]
];
```

- Create your own model that you have to use
  ```bash
  php artisan make:model Channel
  ```

  Once the `app/Models/Channel.php` model is created in our app folder, we will make it extend from the `Shopper\Core\Models\Channel` model available in Shopper.

- Extend our Channel model from the Channel Shopper Model
  ```php
  namespace App\Models;

  use Shopper\Core\Models\Channel as ShopperChannel;

  class Channel extends ShopperChannel
  {
  }
  ```

- Update `channel` key for the model on the `models.php` config file to use our new model
  ```php
  return [
    'models' => [
      'channel'  => \App\Models\Channel::class,
    ]
  ];
  ```

## Manage Channel

### Create channel
Channels are not yet a highly developed feature on Shopper. But if you want to add a channel you can do it this way

```php
use App\Models\Channel;

$channel = Channel::create([
  'name' => $name = 'Telegram',
  'slug' => $name,
  'url' => 'https://t.me/+UnTRApWa50zoRO0I',
  'is_default' => false,
]);
```
