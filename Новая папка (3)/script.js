// Базовая база данных рецептов (прототип)
const initialRecipes = [
    {
        id: 1,
        name: "Итальянская Паста Карбонара",
        description: "Классическая паста со сливочным соусом, беконом и пармезаном.",
        emoji: "🍝",
        ingredients: ["Спагетти (200г)", "Бекон (150г)", "Сливки (100мл)", "Сыр Пармезан (50г)", "Яйцо (2 шт)"]
    },
    {
        id: 2,
        name: "Зеленый салат с авокадо",
        description: "Легкий и свежий салат для здорового перекуса или завтрака.",
        emoji: "🥑",
        ingredients: ["Авокадо (1 шт)", "Листья салата (1 пучок)", "Огурец (2 шт)", "Оливковое масло", "Лимонный сок"]
    },
    {
        id: 3,
        name: "Домашний сырный суп",
        description: "Нежный, согревающий суп с гренками и куриным филе.",
        emoji: "🥣",
        ingredients: ["Куриное филе (300г)", "Плавленый сыр (200г)", "Картофель (3 шт)", "Морковь (1 шт)", "Сухарики"]
    }
];

// Ключи для LocalStorage
const STORAGE_KEYS = {
    menu: 'chefbook_menu_plan',
    bought: 'chefbook_bought_items'
};

// DOM Элементы
const recipesContainer = document.getElementById('recipes-container');
const planRecipeSelect = document.getElementById('plan-recipe');
const plannerForm = document.getElementById('planner-form');
const plannerTbody = document.getElementById('planner-tbody');
const shoppingListContainer = document.getElementById('shopping-list-container');
const clearShoppingBtn = document.getElementById('clear-shopping-btn');
const tabPlannerRadio = document.getElementById('tab-planner');

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initRecipes();
    renderMenuPlan();
    renderShoppingList();
});

// 1. Отрисовка кулинарной книги
function initRecipes() {
    recipesContainer.innerHTML = '';
    planRecipeSelect.innerHTML = '';

    initialRecipes.forEach(recipe => {
        // Создаем карточку в каталог
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <div class="recipe-image">${recipe.emoji}</div>
            <div class="recipe-content">
                <h3>${recipe.name}</h3>
                <p>${recipe.description}</p>
                <div class="ingredients-preview">
                    <strong>Ингредиенты:</strong><br>
                    ${recipe.ingredients.slice(0, 3).join(', ')}...
                </div>
                <label for="tab-planner" class="action-btn" onclick="selectRecipeForPlan(${recipe.id})">Запланировать блюдо</label>
            </div>
        `;
        recipesContainer.appendChild(card);

        // Наполняем Select в форме планировщика
        const option = document.createElement('option');
        option.value = recipe.id;
        option.textContent = recipe.name;
        planRecipeSelect.appendChild(option);
    });
}

// Перенаправление из каталога в форму
window.selectRecipeForPlan = function(recipeId) {
    planRecipeSelect.value = recipeId;
};

// 2. Обработка добавления блюда в меню
plannerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const day = document.getElementById('plan-day').value;
    const meal = document.getElementById('plan-meal').value;
    const recipeId = parseInt(planRecipeSelect.value);
    const recipe = initialRecipes.find(r => r.id === recipeId);

    const planItem = {
        id: Date.now(),
        day,
        meal,
        recipeName: recipe.name,
        ingredients: recipe.ingredients
    };

    const currentMenu = getStoredData(STORAGE_KEYS.menu);
    currentMenu.push(planItem);
    setStoredData(STORAGE_KEYS.menu, currentMenu);

    renderMenuPlan();
    renderShoppingList();
    plannerForm.reset();
});

// 3. Отрисовка расписания меню
function renderMenuPlan() {
    const menu = getStoredData(STORAGE_KEYS.menu);
    plannerTbody.innerHTML = '';

    if (menu.length === 0) {
        plannerTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#7f8c8d;">План пуст. Добавьте блюда на неделю!</td></tr>`;
        return;
    }

    // Сортировка по дням недели для красоты (упрощенная)
    const daysOrder = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
    menu.sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));

    menu.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b>${item.day}</b></td>
            <td>${item.meal}</td>
            <td>${item.recipeName}</td>
            <td><button class="delete-btn" onclick="deleteMenuPlan(${item.id})">Удалить</button></td>
        `;
        plannerTbody.appendChild(tr);
    });
}

window.deleteMenuPlan = function(id) {
    let menu = getStoredData(STORAGE_KEYS.menu);
    menu = menu.filter(item => item.id !== id);
    setStoredData(STORAGE_KEYS.menu, menu);
    renderMenuPlan();
    renderShoppingList();
};

// 4. Логика списка покупок (собирает ингредиенты из всех запланированных рецептов)
function renderShoppingList() {
    const menu = getStoredData(STORAGE_KEYS.menu);
    const boughtItems = getStoredData(STORAGE_KEYS.bought);
    shoppingListContainer.innerHTML = '';

    if (menu.length === 0) {
        shoppingListContainer.innerHTML = `<li style="text-align:center; color:#7f8c8d; width:100%;">Список пуст. Запланируйте блюда, и продукты появятся здесь автоматически.</li>`;
        return;
    }

    // Собираем все уникальные ингредиенты
    let allIngredients = [];
    menu.forEach(item => {
        allIngredients = allIngredients.concat(item.ingredients);
    });
    // Убираем дубликаты
    const uniqueIngredients = [...new Set(allIngredients)];

    uniqueIngredients.forEach((ing, index) => {
        const isChecked = boughtItems.includes(ing);
        const li = document.createElement('li');
        li.className = 'shopping-item';
        li.innerHTML = `
            <input type="checkbox" id="ing-${index}" ${isChecked ? 'checked' : ''} onchange="toggleBought('${ing}')">
            <span>${ing}</span>
        `;
        shoppingListContainer.appendChild(li);
    });
}

// Переключение галочки купленного товара
window.toggleBought = function(ingredient) {
    let boughtItems = getStoredData(STORAGE_KEYS.bought);
    if (boughtItems.includes(ingredient)) {
        boughtItems = boughtItems.filter(i => i !== ingredient);
    } else {
        boughtItems.push(ingredient);
    }
    setStoredData(STORAGE_KEYS.bought, boughtItems);
};

// Полная очистка планов и покупок
clearShoppingBtn.addEventListener('click', () => {
    if (confirm("Очистить текущее меню и список покупок?")) {
        localStorage.removeItem(STORAGE_KEYS.menu);
        localStorage.removeItem(STORAGE_KEYS.bought);
        renderMenuPlan();
        renderShoppingList();
    }
});

// Хелперы LocalStorage
function getStoredData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}
function setStoredData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
