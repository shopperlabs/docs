# Attributes
In this section, you’ll learn about Attributes in Shopper and their relation to other entities.

On Shopper, attributes are features that can be added to products but which do not affect the price of the product, where one variant has a different price to another.

Above all, attributes allow you to differentiate your products according to features that you deem to have no impact on the price of the product (a long description, the color of a T-shirt, etc).

## Overview
By default, shopper allows you to configure 8 types of attributes, which you can easily add to your products:

- Input (text)
- Input (number)
- Rich Text
- Select
- Checkbox
- Radio
- Color picker
- Date picker

Each attribute can be enabled or disabled, and has an icon to visually identify it from the others.
And you can configure the attributes so that they can be searched or filtered, depending on the needs of your store front.

<div class="screenshot">
  <img src="/img/screenshots/{{version}}/attributes.png" alt="Attributes">
  <div class="caption">Attributes</div>
</div>

### Fields
The models used to manage attributes are `Shopper\Core\Models\Attribute`, `Shopper\Core\Models\AttributeValue` and `Shopper\Core\Models\AttributeProduct` for the relation with the product.

The initial **Attribute** Model

| Name        | Type      | Required   |  Notes   |
|-------------|-----------|------------|------------|
| `id`  | autoinc |         |  auto  |
| `name`    | string  | yes |   |
| `slug`    | string  | yes | Unique, default value is auto generated using attribute name |
| `type` | string  | yes | Available types `text`, `number`, `richtext`, `select`, `checkbox`, `radio`, `colorpicker`, `datepicker` |
| `description` | string  | no | Nullable |
| `is_enabled` | boolean  | no | Default `false` |
| `is_searchable` | boolean  | no | Default `false` |
| `is_filterable` | boolean  | no | Default `false` |

Some attributes can have several values, which can be the case for select, checkbox and radio attributes. Their values are recorded by an **AttributeValue** Model

| Name        | Type      | Required   |  Notes   |
|-------------|-----------|------------|------------|
| `id`  | autoinc |         |  auto  |
| `value`    | string  | yes |   |
| `key`    | string  | yes | Unique |
| `position` | int  | no | Default `1` |
| `attribute_id` | int  | yes | Attribute ID |

The 3rd and final model involved in attribute management is the **AttributeProduct** Model, which establishes the relationship between Attribute and Product. This model stores all the attributes that a product can have on Shopper

| Name        | Type      | Required   |  Notes   |
|-------------|-----------|------------|------------|
| `id`  | autoinc |         |  auto  |
| `attribute_id` | int  | yes | Attribute ID |
| `product_id` | int  | yes | Product ID |
| `attribute_value_id` | int  | no | Nullable, if the attribute is of type string or richtext, as these cannot have preselectable values |
| `attribute_custom_value` | string  | no | Nullable, this field is reserved for attributes that have no value, such as character strings, datepicker or similar text values. |

### Components
Livewire components for managing attributes are available in the component configuration file `config/shopper/components.php`.

```php
use Shopper\Http\Livewire;
use Shopper\Http\Livewire\Components;

return [
  'livewire' => [

    'attributes.browse' => Components\Attributes\Browse::class,
    'attributes.create' => Components\Attributes\Create::class,
    'attributes.edit' => Components\Attributes\Edit::class,
    'attributes.values' => Components\Attributes\Values::class,

    'modals.create-role' => Livewire\Modals\CreateRole::class,
    'modals.update-value' => Livewire\Modals\UpdateValue::class,

    'tables.attributes-table' => Livewire\Tables\AttributesTable::class,

  ];
];
```

## Manage Attributes
The attributes are accessible via the **Products > Attributes** Menu on the left sidebar. The display page is rendered by the Livewire component `Shopper\Http\Livewire\Components\Attributes\Browse` and for the display of the attributes table is the component `Shopper\Http\Livewire\Tables\AttributesTable`.

You can modify them in the components configuration file to use your own component.

### Create attribute
Click on the **"Create"** button on the attributes page, and a creation form appears.

<div class="screenshot">
  <img src="/img/screenshots/{{version}}/create-attribute.png" alt="Create attribute">
  <div class="caption">Create attribute</div>
</div>

### Update attribute
To update an attribute, simply select it in the table, and you can modify the information about the attribute.
If this attribute has values, you can also modify, add or even delete them. You have full control over this page

<div class="screenshot">
  <img src="/img/screenshots/{{version}}/update-attribute.png" alt="Update attribute">
  <div class="caption">Update attribute</div>
</div>
