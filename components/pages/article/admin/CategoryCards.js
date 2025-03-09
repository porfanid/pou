import React from 'react';
import renderArticleCard from './ArticleCard';

const renderCategoryCards = (articles, isAlreadyPublished, isEarlyReleased) => {
    return (
        <div className="flex flex-wrap gap-4 justify-center">
            {articles.map((file, index) => (
                <div key={index} className="w-full sm:w-auto">
                    {renderArticleCard(file, isAlreadyPublished, isEarlyReleased)}
                </div>
            ))}
        </div>
    );
}

export default renderCategoryCards;