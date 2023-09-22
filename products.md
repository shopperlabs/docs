# Products
Products play a central role in the world of online commerce, and this section is dedicated to helping you make the most of your catalog and provide an exceptional shopping experience to your customers.

## Overview
No matter your industry, whether you're selling clothing, electronics, handcrafted goods, or any other type of merchandise, this section will guide you through the process of creating, customizing, and efficiently managing your products. Our goal is to provide you with the tools and knowledge you need to succeed in presenting your products attractively, managing your inventory effectively, and boosting your online sales.

<div class="screenshot">
  <img src="/img/screenshots/{{version}}/products.png" alt="Products">
  <div class="caption">Products</div>
</div>

## Fields
The model used is `Shopper\Core\Models\Product`.

| Name        | Type      | Required   |  Notes   |
|-------------|-----------|------------|------------|
| `id`  | autoinc |         |  auto  |
| `name`    | string  | yes |   |
| `slug`    | string  | yes | Unique, default value is auto generated using product name |
| `sku` | string  | no | Nullable but if defined has to be `unique`, for *stock keeping unit* |
| `barcode` | string  | no | Nullable, the string used to generate your product barcode |
| `description` | string  | no | Nullable |
| `security_stock` | integer  | no | Default `0` |
| `featured` | boolean  | no | Default `false`, defined if your product is featured |
| `is_visible` | boolean  | no | Default `false`, defined if your product can be visible in your store |
| `old_price_amount` | integer  | no | Default `null` |
| `price_amount` | integer  | no | Default `null`, the original price of the product |
| `cost_amount` | integer  | no | Default `null`, Defined the overall cost of obtaining the product |
| `type` | enum  | no | `['deliverable', 'downloadable']`, the default value is `deliverable` |
| `backorder` | boolean  | no | Default `false` |
| `require_shipping` | boolean  | no | Default `false` |
| `published_at` | dateTimeTz  | no | Default `now()` |
| `brand_id` | int  | no | The ID of the related brand |
| `parent_id` | int  | no | The ID of the related product (his parent) |
| `weight_unit` | string  | no | Default `kg` |
| `weight_value` | decimal(10, 5)  | no | Default 0.00 |
| `height_unit` | string  | no | Default `cm` |
| `height_value` | decimal(10, 5)  | no | Default 0.00 |
| `width_unit` | string  | no | Default `cm` |
| `width_value` | decimal(10, 5)  | no | Default 0.00 |
| `depth_unit` | string  | no | Default `cm` |
| `depth_value` | decimal(10, 5)  | no | Default 0.00 |
| `volume_unit` | string  | no | Default `l` |
| `volume_value` | decimal(10, 5)  | no | Default 0.00 |

:::tip
Models are customizable, and we recommend changing the **Product** model when you configure your store. To change the model you need to look at the configuration file `config/shopper/models.php`.
:::

```php
return [
  'models' => [
    /*
    |--------------------------------------------------------------------------
    | Product Model
    |--------------------------------------------------------------------------
    |
    | Eloquent model should be used to retrieve your products. Of course,
    | if you want to change this to use a custom model, your model needs to extends the
    | \Shopper\Core\Models\Product model.
    |
    */

    'product'  => \Shopper\Core\Models\Product::class, // [tl! focus]
  ]
];
```

- Create your own model that you have to use
  ```bash
  php artisan make:model Product
  ```

  Once the `app/Models/Product.php` model is created in our app folder, we will make it extend from the `Shopper\Core\Models\Product` model available in Shopper.

- Extend our Product model from the Product's Shopper Model
  ```php
  namespace App\Models;

  use Shopper\Core\Models\Product as ShopperProduct;

  class Product extends ShopperProduct
  {
  }
  ```

- Update `product` key for the model on the `models.php` config file to use our new model
  ```php
  return [
    'models' => [
      /*
      |--------------------------------------------------------------------------
      | Product Model
      |--------------------------------------------------------------------------
      |
      | Eloquent model should be used to retrieve your products. Of course,
      | if you want to change this to use a custom model, your model needs to extends the
      | \Shopper\Core\Models\Product model.
      |
      */

      'product'  => \App\Models\Product::class, // [tl! focus]
    ]
  ];
  ```

### Components
Livewire components for managing products are available in the component configuration file `config/shopper/components.php` prefix by `products.*`.

```php
use Shopper\Http\Livewire;
use Shopper\Http\Livewire\Components;

return [
  'livewire' => [

    'products.browse' => Components\Products\Browse::class,
    'products.create' => Components\Products\Create::class,
    'products.edit' => Components\Products\Edit::class,
    'products.form.attributes' => Components\Products\Form\Attributes::class,
    'products.form.edit' => Components\Products\Form\Edit::class,
    'products.form.inventory' => Components\Products\Form\Inventory::class,
    'products.form.related-products' => Components\Products\Form\RelatedProducts::class,
    'products.form.seo' => Components\Products\Form\Seo::class,
    'products.form.shipping' => Components\Products\Form\Shipping::class,
    'products.form.variants' => Components\Products\Form\Variants::class,
    'products.variant' => Components\Products\Variant::class,
    'products.variant-stock' => Components\Products\VariantStock::class,

    'tables.products-table' => Livewire\Tables\ProductsTable::class,

  ];
];
```

## Manage Products
The products are accessible via the **Products** Menu on the left sidebar. The display page is rendered by the Livewire component `Shopper\Http\Livewire\Components\Products\Browse` and for the display of the brands table is the component `Shopper\Http\Livewire\Tables\ProductsTable`.

### Create product
#### Using interface
From your products interface, click on the **"Add new product"** button on the page

<div class="screenshot">
  <img src="/img/screenshots/{{version}}/create-product.png" alt="Create new product">
  <div class="caption">Create product</div>
</div>

Save your changes in order to be taken back to the products list. Required fields are marked with an **asterisk (*)**.

The Livewire component used to create a client is [Shopper\Http\Livewire\Components\Products\Create](https://github.com/shopperlabs/shopper/blob/2.x/packages/admin/src/Http/Livewire/Components/Products/Create.php).
And in the store function we have

```php
use Shopper\Core\Repositories\Ecommerce\ProductRepository;

$this->validate($this->rules());

$product = (new ProductRepository())->create([ // [tl! collapse:start]
  'name' => $this->name,
  'slug' => $this->name,
  'sku' => $this->sku,
  'barcode' => $this->barcode,
  'description' => $this->description,
  'security_stock' => $this->securityStock,
  'is_visible' => $this->isVisible,
  'old_price_amount' => $this->old_price_amount,
  'price_amount' => $this->price_amount,
  'cost_amount' => $this->cost_amount,
  'type' => $this->type,
  'requires_shipping' => $this->requiresShipping,
  'backorder' => $this->backorder,
  'published_at' => $this->publishedAt ?? now(),
  'seo_title' => $this->seoTitle,
  'seo_description' => str_limit($this->seoDescription, 157),
  'weight_value' => $this->weightValue ?? null,
  'weight_unit' => $this->weightUnit,
  'height_value' => $this->heightValue ?? null,
  'height_unit' => $this->heightUnit,
  'width_value' => $this->widthValue ?? null,
  'width_unit' => $this->widthUnit,
  'volume_value' => $this->volumeValue ?? null,
  'volume_unit' => $this->volumeUnit,
  'brand_id' => $this->brand_id ?? null,
]); // [tl! collapse:end]

if (collect($this->files)->isNotEmpty()) {
  collect($this->files)->each(
    fn ($file) => $product->addMedia($file)->toMediaCollection(config('shopper.core.storage.collection_name'))
  );
}

if (collect($this->category_ids)->isNotEmpty()) {
  $product->categories()->attach($this->category_ids);
}

if (collect($this->collection_ids)->isNotEmpty()) {
  $product->collections()->attach($this->collection_ids);
}

$product->channels()->attach($this->defaultChannel->id);

if ($this->quantity && count($this->quantity) > 0) {
  foreach ($this->quantity as $inventory => $value) {
    $product->mutateStock(
      $inventory,
      (int) $value,
      [
        'event' => __('shopper::pages/products.inventory.initial'),
        'old_quantity' => $value,
      ]
    );
  }
}

session()->flash('success', __('shopper::pages/products.notifications.create'));

$this->redirectRoute('shopper.products.index');
```

#### Using code
If you use another interface (or API) to save your products, you can save directly using your Model.

```php
use App\Models\Product;

$product = Product::create([
  'name' => $name = 'Shure MV7X XLR Podcast Microphone',
  'slug' => $name,
  'is_visible' => true,
  'published_at' => now(), // optional
]);
```

The slug cannot be null, you have to fill in the value of the product name and according to that the slug will be generated.

**Full Product Fields**
```php
use App\Models\Product;
use Shopper\Core\Enum\Dimension\Volume;
use Shopper\Core\Enum\Dimension\Weight;

$product = Product::create([
  'name' => $name = 'Shure MV7X XLR Podcast Microphone',
  'slug' => $name,
  'is_visible' => true,
  'published_at' => now(),
  'sku' => 'SHURE-MV7X-XLR',
  'barcode' => '4445645656',
  'description' => 'The MV7X incorporates the same impressive combination of dynamic capsule, cardioid directional characteristic and shock-absorbing suspension as the MV7.',
  'security_stock' => 10,
  'old_price_amount' => null, // Price devise is defined in setting "$, €, XAF, etc."
  'price_amount' => 250,
  'cost_amount' => 200,
  'type' => 'deliverable',
  'require_shipping' => true,
  'backorder' => true,
  'seo_title' => 'Shure MV7X XLR Podcast Microphone',
  'seo_description' => 'Your MV7X will bring out your voice and eliminate unwanted background noise, for perfect recordings in less-than-perfect rooms.',
  'weight_value' => 2.00,
  'weight_unit' => Weight::KG->value,
  'volume_value' => 25.58,
  'volume_unit' => Volume::GAL->value,
  'brand_id' => 45, // brand id in your database
]);
```

### Add image to product
In case you're using the standalone product creation, then there's no product image support by default. Product images are save using [Spatie Media Library](https://spatie.be/docs/laravel-medialibrary). After add your new product, you can add an image like this

```php
use App\Models\Product;
$product = Product::create();

if (collect($request->file('files'))->isNotEmpty()) {
  collect($request->file('files'))->each(
    fn ($file) => $product->addMedia($file)->toMediaCollection(config('shopper.core.storage.collection_name'))
  );
}
```

### Product Pricing
By default, you can create products without set price, and the price are saved as integer in the database.

There are 3 types of prices in the database for products, as shown in the following image

<div class="screenshot">
  <img src="/img/screenshots/{{version}}/product-pricing.png" alt="">
  <div class="caption">Product pricing</div>
</div>

- **Price amount** for the `price_amount` in the product fields. This price represents the real price of the product, the one that must be paid by the user.
- **Compare at price** for the `old_price_amount` in the product fields. This price represents the comparative price of the product, for example if you want to create a mini discount without associating a coupon with your product. You're going to have a pitch for customers like: *Normally the product costs 500€ but we'll let you have it for 450€*.
- **Cost per item** for the `cost_amount` in the product fields. This price will never be seen by your customers. The purpose of this field is to allow you to know whether a product has brought you benefits in terms of overall sales. This price will never be seen by your customers. The purpose of this field is to allow you to know whether a product has brought you benefits in terms of overall sales.

**Example**
<div class="screenshot">
  <img src="/img/screenshots/{{version}}/example-pricing.png" alt="">
  <div class="caption">Product pricing example</div>
</div>

In *red* we have the actual price of the product, in *grey* the comparative price.
To get a similar result, you can add a custom attribute to your Product model and use it in your view.

```php
# app/Models/Product.php

use Illuminate\Database\Eloquent\Casts\Attribute;

public function discountPercentage(): Attribute
{
  return Attribute::make(
    get: fn () => $this->old_price_amount > 0
      ? round((($this->old_price_amount - $this->price_amount) / $this->old_price_amount) * 100)
      : 0
  );
}
```

In your Blade view
```blade
<span class='inline-flex items-center rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10'>
  {{ __('-:discount%', ['discount' => $product->discount_percentage]) }}
</span>
```

:::info
It is important to note that this is not a discount coupon. Discount coupons are another Shopper feature that you can find in the [Discounts](/docs/{{version}}/discounts) section.
:::

### Product Associations
When you add a new product, the relationships you can directly set are brand, collections and categories.
<div class="screenshot">
  <img src="/img/screenshots/{{version}}product-relations.png" alt="">
  <div class="caption">Product relations</div>
</div>

```php
$product = Product::create([
  'name' => $name = 'Nike LeBron Soldier 10 FlyEase',
  'slug'  => $name,
  'brand_id' => 5, // [tl! focus]
]);

if (collect([2, 5, 10])->isNotEmpty()) { // [tl! focus:start]
  $product->categories()->attach([2, 5, 10]);
}

if (collect([1, 2, 3])->isNotEmpty()) {
  $product->collections()->attach([1, 2, 3]);
} // [tl! focus:end]
```

### Product Stock
Product stock are managed in the `inventory_histories` table.
<div class="screenshot">
  <img src="/img/screenshots/{{version}}/product-inventory.png" alt="">
  <div class="caption">Product stock</div>
</div>

The model used for manage stock is `Shopper\Core\Models\InventoryHistory`
| Name        | Type      | Required   |  Notes   |
|-------------|-----------|------------|------------|
| `id` | autoinc |         |  auto  |
| `stockable` | morphs  | yes | the stockable model |
| `reference` | morphs  | no | Nullable |
| `quantity` | integer  | yes | The product stock quantity |
| `old_quantity` | integer  | no | Default `0`, if the stock changed, we save the old value here |
| `event` | string  | no | Nullable, to defined the current action. Eg: Initial, Stock, Seller stock, etc |
| `description` | morphs  | no | Nullable |
| `inventory_id` | int  | no | The ID of the current Inventory |
| `user_id` | int  | no | The ID of the user who updated the stock |

```php
use Shopper\Core\Models\Inventory;
use App\Models\Product;

$inventory = Inventory::default()->first();
$product = Product::create([
  'name' => $name = 'Nike LeBron Soldier 10 FlyEase',
  'slug'  => $name,
]);

echo $product->stock;
// 0

$product->mutateStock(
  inventoryId: $inventory->id,
  quantity: 10,
  arguments: [
    'event' => __('Initial inventory'),
    'old_quantity' => 0, // optional
  ]
);

echo $product->stock;
// 10

echo $product->inStock() ? 'In stock' : 'Out stock'
// In stock
```

### Product Shipping
If you want your products delivered using services such as FedEx, UPS or DHL, you will need to specify the dimensions of your parcel. You can specify the delivery details for your product

<div class="screenshot">
  <img src="/img/screenshots/{{version}}/product-shipping.png" alt="">
  <div class="caption">Product shipping</div>
</div>

To define dimensions Shopper has 3 Enum classes `Shopper\Core\Enum\Dimension\Length`, `Shopper\Core\Enum\Dimension\Volume` and `Shopper\Core\Enum\Dimension\Weight`

```php
use Shopper\Core\Enum\Dimension\Volume; // [tl! focus]
use Shopper\Core\Enum\Dimension\Weight; // [tl! focus]

$product = Product::create([
  'name' => $name = 'Nike LeBron Soldier 10 FlyEase',
  'slug'  => $name,
  'require_shipping' => true, // [tl! focus:start]
  'weight_value' => 25,
  'weight_unit' => Weight::KG->value,
  'volume_value' => 25,
  'volume_unit' => Volume::L->value, // [tl! focus:end]
]);
```

### Product Visibility
By default, when you create a product, it will immediately be considered as published.
<div class="screenshot">
  <img src="/img/screenshots/{{version}}/product-visibility.png" alt="">
  <div class="caption">Product visibility</div>
</div>

```php
$product = Product::create([
  'name' => $name = 'Shure MV7X XLR Podcast Microphone',
  'slug' => $name,
  'is_visible' => true, // or false to hide this product
  'published_at' => now()->addDays(10), // available after 10 days
]);
```

On your controller to get all published products you can use the `publish` scope

```php
$products = Product::publish()->get();
```
