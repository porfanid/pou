import ArticlePage, {getServerSidePropsGeneric}  from "../[id]";


export default ArticlePage;
export async function getServerSideProps(context) {
    const admin = require('../../../firebase/adminConfig');
    return await getServerSidePropsGeneric(context, true, admin);
}