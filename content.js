// 等待页面加载完成后初始化
window.addEventListener('load', () => {
    setTimeout(initializeHelper, 1000);
});

// 初始化助手
function initializeHelper() {
    // 检查是否在优惠券页面
    if (!window.location.href.includes('/merchantOffers/offer-hub') && 
        !window.location.href.includes('/merchantOffers/offerCategoriesPage')) {
        console.log('不在优惠券页面，不初始化插件');
        return;
    }
    
    console.log('在优惠券页面，开始初始化插件');
    
    // 添加浮动按钮
    addFloatingButton();
}

// 添加浮动按钮
function addFloatingButton() {
    try {
        // 检查是否已存在浮动按钮，避免重复添加
        if (document.getElementById('chase-offer-helper')) {
            console.log('浮动按钮已存在，不重复添加');
            return;
        }
        
        // 创建浮动容器
        const floatingDiv = document.createElement('div');
        floatingDiv.id = 'chase-offer-helper';
        floatingDiv.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 20px;
            z-index: 10000;
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-family: system-ui;
            min-width: 200px;
        `;

        // 创建标题容器（用于放置标题和关闭按钮）
        const titleContainer = document.createElement('div');
        titleContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 10px;
        `;
        titleContainer.className = 'title-container'; // 添加类名便于查找

        // 创建标题
        const title = document.createElement('div');
        title.textContent = 'Chase Offer Helper';
        title.style.cssText = `
            font-size: 14px;
            font-weight: bold;
            color: #2c2c2c;
        `;

        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: #666;
            font-size: 18px;
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 4px;
            line-height: 1;
        `;
        closeButton.addEventListener('click', () => {
            if (floatingDiv && document.body.contains(floatingDiv)) {
                floatingDiv.remove();
            }
        });

        // 组装标题容器
        titleContainer.appendChild(title);
        titleContainer.appendChild(closeButton);

        // 创建进度显示容器
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container'; // 添加类名便于查找
        progressContainer.style.cssText = `
            display: none;
            flex-direction: column;
            gap: 5px;
            width: 100%;
        `;

        // 创建数量统计
        const progressText = document.createElement('div');
        progressText.className = 'progress-text'; // 添加类名便于查找
        progressText.style.cssText = `
            font-size: 12px;
            color: #666;
            text-align: center;
        `;

        // 创建进度条
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar'; // 添加类名便于查找
        progressBar.style.cssText = `
            width: 100%;
            height: 4px;
            background-color: #eee;
            border-radius: 2px;
            overflow: hidden;
        `;

        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill'; // 添加类名便于查找
        progressFill.style.cssText = `
            width: 0%;
            height: 100%;
            background-color: #117ACA;
            transition: width 0.3s ease;
        `;

        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressText);
        progressContainer.appendChild(progressBar);

        // 创建按钮
        const button = document.createElement('button');
        button.textContent = 'Add All Offers';
        button.className = 'action-button'; // 添加类名便于查找
        button.style.cssText = `
            padding: 8px 16px;
            background-color: #117ACA;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        `;

        // 添加鼠标悬停效果
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = '#0e69b0';
        });
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = '#117ACA';
        });

        // 添加点击事件
        button.addEventListener('click', startAddingOffers);

        // 组装浮动窗口
        floatingDiv.appendChild(titleContainer);
        floatingDiv.appendChild(progressContainer);
        floatingDiv.appendChild(button);

        // 添加到页面
        document.body.appendChild(floatingDiv);
        console.log('浮动按钮添加成功');
    } catch (error) {
        console.error('添加浮动按钮时出错:', error);
    }
}

async function startAddingOffers() {
    try {
        // 使用类选择器查找元素，更加可靠
        const floatingDiv = document.getElementById('chase-offer-helper');
        if (!floatingDiv) {
            console.error('未找到浮动窗口元素');
            return;
        }
        
        const titleContainer = floatingDiv.querySelector('.title-container');
        const progressContainer = floatingDiv.querySelector('.progress-container');
        const button = floatingDiv.querySelector('.action-button');
        
        // 检查所有必要的元素是否存在
        if (!progressContainer || !button) {
            console.error('未找到必要的UI元素');
            return;
        }
        
        const progressText = progressContainer.querySelector('.progress-text');
        const progressBar = progressContainer.querySelector('.progress-bar');
        const progressFill = progressContainer.querySelector('.progress-fill');
        
        if (!progressText || !progressBar || !progressFill) {
            console.error('进度容器结构不完整');
            return;
        }
        
        if (button.disabled) {
            return;
        }

        // 创建动态省略号
        let dots = '';
        let dotInterval;

        try {
            button.disabled = true;
            button.style.display = 'none';
            progressContainer.style.display = 'flex';
            progressText.textContent = '0 offers added - Adding offers';
            progressFill.style.width = '0%';
            
            // 启动动态省略号
            dotInterval = setInterval(() => {
                dots = dots.length >= 3 ? '' : dots + '.';
                const currentText = progressText.textContent.split(' - ')[0];
                progressText.textContent = `${currentText} - Adding offers${dots}`;
            }, 500);
            
            const addedCount = await processOffers((current) => {
                // 检查元素是否仍然存在
                if (progressText && progressText.textContent) {
                    // 更新已添加数量，保持动态省略号
                    const currentDots = progressText.textContent.split(' - ')[1]?.replace('Adding offers', '') || '';
                    progressText.textContent = `${current} offers added - Adding offers${currentDots}`;
                }
            });

            // 停止动态省略号
            clearInterval(dotInterval);
            
            // 确保元素仍然存在
            if (progressText && progressFill) {
                // 显示完成状态
                progressText.textContent = `${addedCount} offers added`;
                progressFill.style.width = '100%';
            }
            
            await delay(1000); // 显示完成状态1秒
            alert(`Complete! Successfully added ${addedCount} offers.`);

        } catch (error) {
            console.error('添加过程出错:', error);
            clearInterval(dotInterval);
            alert('An error occurred. Please refresh the page and try again.');
        } finally {
            // 清理所有状态
            clearInterval(dotInterval);
            
            // 确保浮动窗口还存在
            if (!floatingDiv || !document.body.contains(floatingDiv)) {
                console.log('浮动窗口已被移除，不需要更新UI');
                return;
            }
            
            try {
                // 移除所有旧的UI元素
                const elementsToRemove = floatingDiv.querySelectorAll('.progress-container, .action-button');
                elementsToRemove.forEach(element => element.remove());
                
                // 重新创建并添加按钮
                const newButton = document.createElement('button');
                newButton.textContent = 'Add All Offers';
                newButton.className = 'action-button';
                newButton.style.cssText = `
                    padding: 8px 16px;
                    background-color: #117ACA;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background-color 0.2s;
                `;
                newButton.addEventListener('mouseover', () => {
                    newButton.style.backgroundColor = '#0e69b0';
                });
                newButton.addEventListener('mouseout', () => {
                    newButton.style.backgroundColor = '#117ACA';
                });
                newButton.addEventListener('click', startAddingOffers);
                
                floatingDiv.appendChild(newButton);
            } catch (cleanupError) {
                console.error('清理UI时出错:', cleanupError);
            }
        }
    } catch (error) {
        console.error('startAddingOffers函数执行出错:', error);
        alert('An error occurred. Please refresh the page and try again.');
    }
}

// 查找第一个未添加的优惠券 - 更新以适应新的网页结构
function findFirstUnofficialOffer() {
    console.log('开始寻找未添加的优惠券...');
    
    // 记录找到的总按钮数和被禁用的按钮数
    let totalButtons = 0;
    let disabledButtons = 0;
    
    // 方法0：特别处理"+"按钮，这是最直接的特征
    console.log('使用方法0寻找蓝色加号按钮...');
    const plusButtons = document.querySelectorAll('button svg[fill="rgb(17, 122, 202)"], button svg[fill="#117ACA"], [role="button"] svg[fill="rgb(17, 122, 202)"], [aria-label="Add"] svg');
    
    if (plusButtons.length > 0) {
        console.log(`找到 ${plusButtons.length} 个加号按钮`);
        for (const svg of plusButtons) {
            const button = svg.closest('button') || svg.closest('[role="button"]');
            if (button && !button.disabled && !isElementHidden(button)) {
                // 向上查找父元素，确认这是优惠卡片
                const card = findParentCard(button);
                if (card) {
                    // 检查卡片是否有绿色对勾，如果有就跳过
                    const hasCheckmark = Array.from(card.querySelectorAll('*')).some(el => {
                        const style = window.getComputedStyle(el);
                        return style.color.includes('rgb(0, 128') || // 绿色
                               style.color.includes('rgb(33, 150') || // 绿色
                               style.color.includes('rgb(46, 125') || // 绿色
                               el.innerHTML.includes('✓');
                    });
                    
                    if (!hasCheckmark) {
                        console.log('找到未添加的优惠券加号按钮:', button);
                        return button;
                    }
                } else {
                    console.log('找到未添加的直接加号按钮:', button);
                    return button;
                }
            }
        }
    }
    
    // 如果没有找到蓝色加号按钮，则直接返回null，不再继续查找
    // 之前的方法可能会误报并点击已添加的优惠券导致页面跳转
    console.log('没有找到蓝色加号按钮的未添加优惠券，认为所有优惠券已添加完成');
    return null;

    // 以下代码被注释掉，不再使用其他方法查找优惠券
    /*
    // 方法1：使用 data-testid 属性搜索，这是最准确的方法
    const offerElements = document.querySelectorAll('div[data-testid="offer-card"], div[data-testid*="offer"], [data-testid*="Offer"]');
    console.log(`方法1找到 ${offerElements.length} 个可能的优惠券元素`);
    
    // 如果找到了可能的优惠券元素，尝试处理它们
    if (offerElements.length > 0) {
        for (const card of offerElements) {
            try {
                // 更多代码...
            } catch (error) {
                console.error('处理卡片时出错:', error);
            }
        }
    }
    
    // 方法2, 方法3, 方法4...
    */
}

// 辅助函数：检查元素是否隐藏
function isElementHidden(element) {
    const style = window.getComputedStyle(element);
    return style.display === 'none' || 
           style.visibility === 'hidden' || 
           style.opacity === '0' ||
           element.offsetParent === null;
}

// 辅助函数：向上查找优惠卡片
function findParentCard(element) {
    let current = element;
    // 查找最多5层父元素
    for (let i = 0; i < 5; i++) {
        if (!current.parentElement) {
            return null;
        }
        
        current = current.parentElement;
        
        // 检查是否包含现金返还文本
        if (current.textContent.includes('cash back') || 
            current.textContent.includes('% back') || 
            current.textContent.includes('$') && current.textContent.includes('back')) {
            // 可能是优惠卡片
            return current;
        }
        
        // 检查类名是否包含卡片相关词汇
        if (current.className.toLowerCase().includes('card') || 
            current.className.toLowerCase().includes('offer') || 
            current.className.toLowerCase().includes('tile')) {
            return current;
        }
    }
    
    return null;
}

// 处理优惠券添加
async function processOffers(onProgress) {
    let addedCount = 0;
    const originalURL = window.location.href;
    const startTime = Date.now();
    const timeout = 300000; // 5分钟超时
    let consecutiveEmptySearches = 0;
    const maxConsecutiveEmptySearches = 2; // 减少到2次，更快结束
    
    while (Date.now() - startTime < timeout) {
        try {
            if (window.location.href !== originalURL) {
                console.log('页面已改变，返回原始页面');
                window.history.back();
                await delay(600);
                continue;
            }

            // 滚动处理：确保加载更多优惠券
            await scrollPageToLoadMoreOffers();
            
            const button = findFirstUnofficialOffer();
            if (!button) {
                console.log('当前视图没有找到可添加的优惠券');
                consecutiveEmptySearches++;
                
                if (consecutiveEmptySearches >= maxConsecutiveEmptySearches) {
                    console.log(`连续 ${maxConsecutiveEmptySearches} 次未找到优惠券，认为已完成`);
                    break;
                }
                
                // 尝试滚动到不同的位置来找到更多优惠券
                await scrollPageRandomly();
                await delay(600);
                continue;
            }
            
            // 找到了按钮，重置空搜索计数器
            consecutiveEmptySearches = 0;
            
            if (button.disabled) {
                console.log('按钮已禁用，跳过');
                continue;
            }
            
            console.log('点击按钮添加优惠券');
            button.click();
            addedCount++;
            
            if (onProgress) {
                onProgress(addedCount);
            }
            
            // 安全地更新进度条
            try {
                const helperElement = document.getElementById('chase-offer-helper');
                if (helperElement) {
                    const progressFill = helperElement.querySelector('.progress-fill');
                    if (progressFill) {
                        const percentage = Math.min(addedCount * 5, 100);
                        progressFill.style.width = `${percentage}%`;
                    }
                }
            } catch (progressError) {
                console.error('更新进度条时出错:', progressError);
            }
            
            await delay(600);

        } catch (error) {
            console.error('添加优惠券失败:', error);
            await delay(1000);
        }
    }

    if (window.location.href !== originalURL) {
        console.log('完成后返回原始页面');
        window.history.back();
        await delay(600);
    }

    console.log(`总共添加了 ${addedCount} 个优惠券`);
    return addedCount;
}

// 滚动页面以加载更多优惠券
async function scrollPageToLoadMoreOffers() {
    console.log('滚动页面以加载更多优惠券');
    
    // 寻找可能包含优惠券的容器
    const possibleContainers = [
        document.querySelector('main'), 
        document.querySelector('[role="main"]'),
        document.querySelector('[class*="offers-container"]'),
        document.querySelector('[class*="card-container"]'),
        document.querySelector('[data-testid*="offer-container"]'),
        document.querySelector('div[class*="scroll"]'),
        document.body
    ].filter(container => container != null);
    
    if (possibleContainers.length === 0) {
        console.log('未找到可滚动的容器');
        return;
    }
    
    // 选择第一个找到的容器
    const container = possibleContainers[0];
    console.log('找到可滚动容器:', container);
    
    // 记录初始滚动位置
    const initialScrollPosition = container.scrollTop;
    
    // 慢慢滚动到底部，每200毫秒滚动一点
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const scrollTarget = scrollHeight - clientHeight;
    
    console.log(`滚动高度: ${scrollHeight}, 客户区高度: ${clientHeight}, 目标位置: ${scrollTarget}`);
    
    // 分段滚动，每次滚动一部分
    const scrollSteps = 5;
    const scrollIncrement = scrollTarget / scrollSteps;
    
    for (let i = 1; i <= scrollSteps; i++) {
        const targetScrollPosition = Math.min(initialScrollPosition + (scrollIncrement * i), scrollTarget);
        console.log(`滚动到位置: ${targetScrollPosition}`);
        container.scrollTo({
            top: targetScrollPosition,
            behavior: 'smooth'
        });
        await delay(300); // 从500减少到300
    }
    
    // 确保滚动到底部
    container.scrollTo({
        top: scrollTarget,
        behavior: 'smooth'
    });
    
    console.log('滚动完成，等待新内容加载');
    await delay(600); // 从1000减少到600
}

// 随机滚动页面以尝试查找不同位置的优惠券
async function scrollPageRandomly() {
    console.log('随机滚动页面查找更多优惠券');
    
    // 寻找可能包含优惠券的容器
    const possibleContainers = [
        document.querySelector('main'), 
        document.querySelector('[role="main"]'),
        document.querySelector('[class*="offers-container"]'),
        document.querySelector('[class*="card-container"]'),
        document.querySelector('[data-testid*="offer-container"]'),
        document.querySelector('div[class*="scroll"]'),
        document.body
    ].filter(container => container != null);
    
    if (possibleContainers.length === 0) {
        return;
    }
    
    // 选择第一个找到的容器
    const container = possibleContainers[0];
    
    // 获取滚动范围
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    // 生成一个随机位置
    const randomScrollPosition = Math.floor(Math.random() * (scrollHeight - clientHeight));
    
    console.log(`随机滚动到位置: ${randomScrollPosition}`);
    container.scrollTo({
        top: randomScrollPosition,
        behavior: 'smooth'
    });
    
    await delay(600); // 从1000减少到600
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 输出初始化日志
console.log('Chase Offer Helper v1.0.8 已加载'); 