# Brands
Most e-commerce sites sell products from several manufacturers. And each supplier can be represented by a brand.

Unless you make your own products, you should always register the brands of your products in Shopper.

If you sell your own products, you must at least create your company as a brand: this helps your customer find what they are looking for, and this can bring some valuable search engine points.

## Overview
The management of brands is exactly the same as the one done in most of the e-commerce website creation tools: only the name can change. It is mainly used to facilitate the navigation of customers in your catalog, as it is increasingly common to search for a specific brand.

<div class="screenshot">
  <img src="/img/screenshots/{{version}}/brands.png" alt="Brands">
  <div class="caption">Brands</div>
</div>

New brands are automatically activated and available for your online store, even if they do not contain any products yet. You must deactivate them so that they do not appear online.

### Fields
The model used is `Shopper\Core\Models\Brand`.

| Name        | Type      | Required   |  Notes   |
|-------------|-----------|------------|------------|
| `id`  | autoinc |         |  auto  |
| `name`    | string  | yes |   |
| `slug`    | string  | yes | Unique, default value is auto generated using brand name |
| `website` | string  | no | Nullable |
| `description` | longText  | no | Nullable |
| `position` | string  | no | Default `0` |
| `is_enabled` | boolean  | no | Default `false` |
| `seo_title` | string  | no | Nullable, for seo title max length is 60  |
| `seo_description` | string  | no | Nullable, for seo description max length is 160 |

:::tip
Models are customizable, and we recommend changing the **Brand** model when you configure your site. To change the model you need to look at the configuration file `config/shopper/models.php`.
:::

```php
return [
  'models' => [
    /*
    |--------------------------------------------------------------------------
    | Brand Model
    |--------------------------------------------------------------------------
    |
    | Eloquent model should be used to retrieve your brands. Of course,
    | If you want to change this to use a custom model, your model needs to extends the
    | \Shopper\Core\Models\Brand model.
    |
    */

    'brand' => \Shopper\Core\Models\Brand::class, // [tl! focus]

    /*
    |--------------------------------------------------------------------------
    | Category Model
    |--------------------------------------------------------------------------
    |
    | Eloquent model should be used to retrieve your categories. Of course,
    | If you want to change this to use a custom model, your model needs to extends the
    | \Shopper\Core\Models\Category model.
    |
    */

    'category'  => \Shopper\Core\Models\Category::class,
  ]
];
```

- Create your own model that you have to use
  ```bash
  php artisan make:model Brand
  ```

  Once the `app/Models/Brand.php` model is created in our app folder, we will make it extend from the `Shopper\Core\Models\Brand` model available in Shopper.

- Extend our Brand model from the Brand Shopper Model
  ```php
  namespace App\Models;

  use Shopper\Core\Models\Brand as ShopperBrand;

  class Brand extends ShopperBrand
  {
  }
  ```

- Update `brand` key for the model on the `models.php` config file to use our new model
  ```php
  return [
    'models' => [
      /*
      |--------------------------------------------------------------------------
      | Brand Model
      |--------------------------------------------------------------------------
      |
      | Eloquent model should be used to retrieve your brands. Of course,
      | If you want to change this to use a custom model, your model needs to extends the
      | \Shopper\Core\Models\Brand model.
      |
      */

      'brand' => \App\Models\Brand::class, // [tl! focus]

      /*
      |--------------------------------------------------------------------------
      | Category Model
      |--------------------------------------------------------------------------
      |
      | Eloquent model should be used to retrieve your categories. Of course,
      | If you want to change this to use a custom model, your model needs to extends the
      | \Shopper\Core\Models\Category model.
      |
      */

      'category'  => \Shopper\Core\Models\Category::class,
    ]
  ];
  ```

### Components
Livewire components for managing brands are available in the component configuration file `config/shopper/components.php`.

```php
use Shopper\Http\Livewire;
use Shopper\Http\Livewire\Components;

return [
  'livewire' => [

    'brands.browse' => Components\Brands\Browse::class,
    'brands.create' => Components\Brands\Create::class,
    'brands.edit' => Components\Brands\Edit::class,

    'tables.brands-table' => Livewire\Tables\BrandsTable::class,

  ];
];
```

For handling tables in Shopper, we use [Laravel Livewire Tables](https://github.com/rappasoft/laravel-livewire-tables) package by Anthony Rappa.

## Manage Brands
The brands are accessible via the **Brands** Menu on the left sidebar. The display page is rendered by the Livewire component `Shopper\Http\Livewire\Components\Brands\Browse` and for the display of the brands table is the component `Shopper\Http\Livewire\Tables\BrandsTable`.

You can modify them in the components configuration file to use your own.

### Create brand
Click on the **"Add new brand"** button on the brands page, and a creation form appears.

<div class="screenshot">
  <img src="/img/screenshots/{{version}}/create-brand.png" alt="Create brand">
  <div class="caption">Create brand</div>
</div>

Save your changes in order to be taken back to the brand's list. Required fields are marked with an **asterisk (*)**

The SEO section allows you to define how your brand information should be displayed in search engines. To modify the content you click on the button "Edit SEO preview"

<div class="screenshot">
  <img src="/img/screenshots/{{version}}/brand-seo.png" alt="Brand seo">
  <div class="caption">Brand SEO</div>
</div>

By fill the data you will have a direct preview of the content.

### Delete brand
To delete, deactivate or activate brands, you need to select the brand you want to delete and then click on the "Bulk Actions" button to choose the action you want to perform.

<div class="screenshot">
  <img src="/img/screenshots/{{version}}/delete-brand.png" alt="delete brand">
  <div class="caption">Delete brand</div>
</div>

## Retrieve Data
Once you have your brands and you want to display them in your store, you can retrieve them this way in your controller

```php
namespace App\Http\Controllers;

use App\Models\Brand; // [tl! focus]
use App\Models\Product;
use Carbon\Carbon;

class HomeController extends Controller
{
  public function home()
  {
    $products = Product::with('categories', 'attributes')
      ->publish()
      ->take(8)
      ->get()
      ->map(function ($product) {
        $product['is_new'] = $product->created_at
          ->addDays(8)
          ->greaterThanOrEqualTo(Carbon::now());

        return $product;
    });

    return view('home', [
      'products' =>  $products,
      'brands' => Brand::enabled()->limit(12)->get(), // [tl! focus]
    ]);
  }
}
```

:::tip
Knowing that your brands can be displayed on several pages and places in your store, you can create a **View Composer** ([read more about View Composer](https://laravel.com/docs/views#view-composers)).
:::

- Create your brand composer undo a custom folder `app/View/Composers`

```php
namespace App\View\Composers;

use App\Models\Brand;
use Illuminate\View\View;

class BrandsComposer
{
  public function compose(View $view)
  {
    $view->with('brands', Brand::enabled()->limit(12)->get());
  }
}
```

- Then you have to add it in your **AppServiceProvider**

```php
namespace App\Providers;

use App\View\Composers\BrandsComposer; // [tl! focus]
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
  public function boot()
  {
    View::composer('partials.brands', BrandsComposer::class); // [tl! focus]
  }
}
```

And in your front-end you can browse your brands to have a display like this

<div class="screenshot">
  <img src="/img/screenshots/{{version}}/brand-lists.png" alt="Brands preview list">
  <div class="caption">Brands example list</div>
</div>
