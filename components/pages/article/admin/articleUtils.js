export const handleShowList = (files, isAlreadyPublished, isEarlyReleased, sortByCategory, sortByDate, renderCategoryCards, renderArticleCard) => {
    console.log("Admin files");
    console.log(files);

    if (!files) {
        return <div className="row"></div>;
    }

    // Transform the data structure into a flat array of articles with category info
    let articlesArray = [];
    Object.entries(files).forEach(([category, articles]) => {
        Object.entries(articles).forEach(([slug, article]) => {
            articlesArray.push({
                ...article,
                category,
                slug
            });
        });
    });

    if (sortByCategory) {
        // Sort by category name
        articlesArray.sort((a, b) => {
            const categoryA = a.category || 'Uncategorized';
            const categoryB = b.category || 'Uncategorized';
            return categoryA.localeCompare(categoryB);
        });

        // Group by category
        const groupedByCategory = articlesArray.reduce((acc, article) => {
            const category = article.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(article);
            return acc;
        }, {});

        return (
            <>
                {Object.entries(groupedByCategory).map(([category, articles]) => (
                    <div key={category}>
                        <h5 className="text-white">{category}</h5>
                        {renderCategoryCards(articles)}
                    </div>
                ))}
            </>
        );
    }

    if (sortByDate) {
        articlesArray.sort((a, b) => {
            const dateA = new Date(a.date.split('/').reverse().join('-'));
            const dateB = new Date(b.date.split('/').reverse().join('-'));
            return dateB - dateA;
        });
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {articlesArray.map((article, index) => (
                renderArticleCard(article, isAlreadyPublished, isEarlyReleased)
            ))}
        </div>
    );
};