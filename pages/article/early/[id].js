import ArticlePage  from "../[id]";
import { getServerSidePropsGeneric } from "../../../components/pages/article/getData";


export default ArticlePage;
export async function getServerSideProps(context) {
    const admin = require('../../../firebase/adminConfig');
    return await getServerSidePropsGeneric(context, true, admin);
}