// Theme JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 侧边栏切换功能
    const sidebarToggle = document.querySelector('#sidebar-toggle');
    const sidebar = document.querySelector('#sidebar');
    const mainContent = document.querySelector('#main-content');
    const sidebarTexts = document.querySelectorAll('.sidebar-text');
    
    let sidebarCollapsed = false;
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebarCollapsed = !sidebarCollapsed;
            
            if (sidebarCollapsed) {
                sidebar.classList.remove('sidebar-expanded');
                sidebar.classList.add('sidebar-collapsed');
                mainContent.classList.remove('main-content-expanded');
                mainContent.classList.add('main-content-collapsed');
                sidebarTexts.forEach(text => text.style.display = 'none');
            } else {
                sidebar.classList.remove('sidebar-collapsed');
                sidebar.classList.add('sidebar-expanded');
                mainContent.classList.remove('main-content-collapsed');
                mainContent.classList.add('main-content-expanded');
                sidebarTexts.forEach(text => text.style.display = 'block');
            }
        });
    }
    
    // 响应式处理
    function handleResize() {
        if (window.innerWidth < 1024) {
            if (sidebar) {
                sidebar.style.transform = sidebarCollapsed ? 'translateX(0)' : 'translateX(-100%)';
            }
            if (mainContent) {
                mainContent.style.marginLeft = '0';
            }
        } else {
            if (sidebar) {
                sidebar.style.transform = 'translateX(0)';
            }
            if (mainContent) {
                if (sidebarCollapsed) {
                    mainContent.classList.remove('main-content-expanded');
                    mainContent.classList.add('main-content-collapsed');
                } else {
                    mainContent.classList.remove('main-content-collapsed');
                    mainContent.classList.add('main-content-expanded');
                }
            }
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // 初始化
    
    // 精选论文点击事件
    const featuredPapers = document.querySelectorAll('.featured-paper-card');
    featuredPapers.forEach(paper => {
        paper.addEventListener('click', function() {
            const paperId = this.dataset.paperId;
            if (paperId) {
                window.location.href = `/publications.html?id=${paperId}`;
            }
        });
    });
    
    // 新闻卡片点击事件
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach(card => {
        card.addEventListener('click', function() {
            const link = this.querySelector('a');
            if (link) {
                window.location.href = link.href;
            }
        });
    });
});

// 论文页面功能（如果存在）
if (document.querySelector('#publications-tbody')) {
    // 论文搜索、筛选、排序功能
    const publicationsData = [];
    
    // 从页面中获取论文数据
    document.querySelectorAll('.publication-row').forEach(el => {
        publicationsData.push({
            id: parseInt(el.dataset.id) || 0,
            title: el.dataset.title || '',
            authors: el.dataset.authors || '',
            journal: el.dataset.journal || '',
            year: parseInt(el.dataset.year) || 0,
            type: el.dataset.type || '',
            topic: el.dataset.topic || '',
            pdf: el.dataset.pdf || '',
            conference_short: el.dataset.conferenceShort || ''
        });
    });
    
    let currentPage = 1;
    let pageSize = 20;
    let sortField = '';
    let sortOrder = '';
    let filteredPublications = [...publicationsData];
    
    // 搜索功能
    const localSearch = document.querySelector('#local-search');
    if (localSearch) {
        localSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
    
    // 筛选功能
    function applyFilters() {
        const searchKeyword = localSearch ? localSearch.value.toLowerCase().trim() : '';
        const yearFilter = document.querySelector('#year-filter')?.value || '';
        const typeFilter = document.querySelector('#type-filter')?.value || '';
        const topicFilter = document.querySelector('#topic-filter')?.value || '';
        
        filteredPublications = publicationsData.filter(pub => {
            const matchesSearch = !searchKeyword || 
                pub.title.toLowerCase().includes(searchKeyword) ||
                pub.authors.toLowerCase().includes(searchKeyword) ||
                pub.journal.toLowerCase().includes(searchKeyword);
            
            const matchesYear = !yearFilter || pub.year === parseInt(yearFilter);
            const matchesType = !typeFilter || pub.type === typeFilter;
            const matchesTopic = !topicFilter || pub.topic === topicFilter;
            
            return matchesSearch && matchesYear && matchesType && matchesTopic;
        });
        
        currentPage = 1;
        renderPublications();
        updatePagination();
    }
    
    // 重置筛选
    const resetButton = document.querySelector('#reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            if (localSearch) localSearch.value = '';
            const yearFilter = document.querySelector('#year-filter');
            const typeFilter = document.querySelector('#type-filter');
            const topicFilter = document.querySelector('#topic-filter');
            if (yearFilter) yearFilter.value = '';
            if (typeFilter) typeFilter.value = '';
            if (topicFilter) topicFilter.value = '';
            
            filteredPublications = [...publicationsData];
            currentPage = 1;
            renderPublications();
            updatePagination();
        });
    }
    
    // 筛选按钮
    const filterButton = document.querySelector('#filter-button');
    if (filterButton) {
        filterButton.addEventListener('click', applyFilters);
    }
    
    // 排序功能
    function applySorting(field) {
        if (sortField === field) {
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            sortField = field;
            sortOrder = 'asc';
        }
        
        filteredPublications.sort((a, b) => {
            let aValue = a[field];
            let bValue = b[field];
            
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        renderPublications();
    }
    
    // 排序按钮
    document.querySelectorAll('.sort-button').forEach(button => {
        button.addEventListener('click', function() {
            const field = this.dataset.sort;
            if (field) {
                applySorting(field);
            }
        });
    });
    
    // 渲染论文列表
    function renderPublications() {
        const publicationsTbody = document.querySelector('#publications-tbody');
        if (!publicationsTbody) return;
        
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const currentPublications = filteredPublications.slice(startIndex, endIndex);
        
        publicationsTbody.innerHTML = '';
        
        currentPublications.forEach(pub => {
            const row = document.createElement('tr');
            row.className = 'table-row-hover cursor-pointer';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-primary hover:text-secondary cursor-pointer">
                        ${pub.title}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    ${pub.authors}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    ${pub.journal}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    ${pub.year || ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${pub.pdf ? `<a href="${pub.pdf}" target="_blank" class="text-primary hover:text-secondary"><i class="fas fa-eye mr-1"></i>查看详情</a>` : ''}
                </td>
            `;
            publicationsTbody.appendChild(row);
        });
        
        // 更新统计信息
        const totalCountSpan = document.querySelector('#total-count');
        const startIndexSpan = document.querySelector('#start-index');
        const endIndexSpan = document.querySelector('#end-index');
        const totalItemsSpan = document.querySelector('#total-items');
        
        if (totalCountSpan) totalCountSpan.textContent = filteredPublications.length;
        if (startIndexSpan) startIndexSpan.textContent = filteredPublications.length > 0 ? startIndex + 1 : 0;
        if (endIndexSpan) endIndexSpan.textContent = Math.min(endIndex, filteredPublications.length);
        if (totalItemsSpan) totalItemsSpan.textContent = filteredPublications.length;
    }
    
    // 更新分页
    function updatePagination() {
        const totalPages = Math.ceil(filteredPublications.length / pageSize);
        const prevPageBtn = document.querySelector('#prev-page');
        const nextPageBtn = document.querySelector('#next-page');
        const pageNumbers = document.querySelector('#page-numbers');
        
        // 更新上一页按钮状态
        if (prevPageBtn) {
            prevPageBtn.disabled = currentPage === 1;
            if (currentPage === 1) {
                prevPageBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                prevPageBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
        
        // 更新下一页按钮状态
        if (nextPageBtn) {
            nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
            if (currentPage === totalPages || totalPages === 0) {
                nextPageBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                nextPageBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
        
        // 生成页码按钮
        if (pageNumbers) {
            pageNumbers.innerHTML = '';
            
            const maxVisiblePages = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            for (let i = startPage; i <= endPage; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `px-3 py-1 border border-gray-300 rounded text-sm ${i === currentPage ? 'pagination-active' : 'pagination-hover'}`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => {
                    currentPage = i;
                    renderPublications();
                    updatePagination();
                });
                pageNumbers.appendChild(pageBtn);
            }
        }
        
        // 分页按钮事件
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderPublications();
                    updatePagination();
                }
            });
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderPublications();
                    updatePagination();
                }
            });
        }
        
        // 分页大小改变
        const pageSizeSelect = document.querySelector('#page-size');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', function(e) {
                pageSize = parseInt(e.target.value);
                currentPage = 1;
                renderPublications();
                updatePagination();
            });
        }
    }
    
    // 初始化
    renderPublications();
    updatePagination();
}

