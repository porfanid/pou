export const handleShowList = (files, isAlreadyPublished, isEarlyReleased, sortByCategory, sortByDate, renderCategoryCards, renderArticleCard) => {
    let sortedList = !files ? [] : [...files];
    if (sortByCategory) {
        sortedList.sort((a, b) => {
            const categoryA = a.category || 'Uncategorized';
            const categoryB = b.category || 'Uncategorized';
            return categoryA.localeCompare(categoryB);
        });
        const groupedByCategory = sortedList.reduce((acc, article) => {
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
        sortedList.sort((a, b) => {
            const dateA = new Date(a.date.split('/').reverse().join('-'));
            const dateB = new Date(b.date.split('/').reverse().join('-'));
            return dateB - dateA;
        });
    }
    return (
        <div className="row">
            {sortedList.map((file, index) => (
                renderArticleCard(file, isAlreadyPublished, isEarlyReleased)
            ))}
        </div>
    );
}