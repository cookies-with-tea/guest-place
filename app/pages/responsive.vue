<template>
  <div class="responsive-page">
    <h2 class="responsive-page__title">Каталог товаров</h2>
    <div class="responsive-page__content">
      <aside class="responsive-page__sidebar">
        <div class="filters">
          <h3 class="filters__title">Фильтры</h3>
          <div class="filters__group">
            <label class="filters__label">
              <input type="checkbox" class="filters__checkbox" />
              Фильтр 1
            </label>
            <label class="filters__label">
              <input type="checkbox" class="filters__checkbox" />
              Фильтр 2
            </label>
          </div>
        </div>
      </aside>
      <main class="responsive-page__main">
        <div class="responsive-page__list">
          <div v-for="(product, index) in products" :key="index" class="responsive-page-list__item">
            <div class="product-card">
              <div class="product-card__image">
                <img :src="product.image" :alt="product.title" class="product-card__img" />
              </div>
              <div class="product-card__content">
                <h3 class="product-card__title">{{ product.title }}</h3>
                <p class="product-card__description">{{ product.description }}</p>
                <div class="product-card__footer">
                  <span class="product-card__price">{{ product.price }} ₽</span>
                  <button class="product-card__button">В корзину</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <button class="responsive-page__button"> Click on me </button>
  </div>
</template>

<script setup lang="ts">
// Определяем интерфейс для продукта
interface Product {
  title: string
  description: string
  price: number
  image?: string
}

// Массив продуктов
const products: Product[] = [
  {
    title: 'Название товара 1',
    description: 'Краткое описание товара, его особенности и преимущества',
    price: 1990,
    image: 'https://pic.re/image',
  },
  {
    title: 'Еще один товар 2',
    description: 'Описание второго товара, его характеристики и достоинства',
    price: 2490,
    image: 'https://pic.re/image',
  },
  {
    title: 'Третий товар 3',
    description: 'Подробности о третьем товаре, его уникальные свойства',
    price: 3190,
    image: 'https://pic.re/image',
  },
  {
    title: 'Четвертый товар 4',
    description: 'Описание четвертого товара, его преимущества',
    price: 2790,
    image: 'https://pic.re/image',
  },
]
</script>

<style scoped lang="scss">
@use 'styles/helpers/mixins/responsive' as *;

.responsive-page {
  max-width: 1200px;
  padding: 16px;
  margin: 0 auto;

  &__title {
    @include fluid-value(font-size, 768, 1920, 24px, 72px);

    text-align: center;
    margin: 0 0 24px;

    @include responsive(md) {
      font-size: 18px;
    }
  }

  &__content {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;

    @include responsive(sm) {
      grid-template-columns: 1fr;
    }
  }

  &__sidebar {
    width: 300px;
    border-radius: 8px;
    background: #f8f9fa;
    padding: 16px;

    @include responsive(sm) {
      width: 100%;
      order: -1;
    }
  }

  &__main {
    width: 100%;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    margin-bottom: 24px;
    gap: 20px;
  }

  &__button {
    display: block;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    color: #fff;
    background-color: #007bff;
    transition: background-color 0.3s ease;
    cursor: pointer;
    padding: 12px 24px;
    margin: 0 auto;

    &:hover {
      background-color: #0056b3;
    }
  }
}

.filters {
  &__title {
    font-weight: 700;
    font-size: 18px;
    margin: 0 0 16px;
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 8px;
  }

  &__checkbox {
    margin: 0;
  }
}

.product-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgb(0, 0, 0, 0.1);
  background: #fff;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  overflow: hidden;

  &__image {
    width: 100%;
    height: 200px;
    overflow: hidden;

    .product-card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .product-card:hover & .product-card__img {
      transform: scale(1.05);
    }
  }

  &__content {
    padding: 16px;
  }

  &__title {
    font-weight: 700;
    font-size: 18px;
    color: #333;
    margin: 0 0 8px;
  }

  &__description {
    font-size: 14px;
    line-height: 1.5;
    color: #666;
    margin: 0 0 16px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__price {
    font-weight: 700;
    font-size: 18px;
    color: #e74c3c;
  }

  &__button {
    border: none;
    border-radius: 6px;
    font-size: 14px;
    color: #fff;
    background-color: #2ecc71;
    transition: background-color 0.3s ease;
    cursor: pointer;
    padding: 8px 16px;

    &:hover {
      background-color: #27ae60;
    }
  }

  &:hover {
    box-shadow: 0 12px 24px rgb(0, 0, 0, 0.15);
    transform: translateY(-8px);
  }
}
</style>
