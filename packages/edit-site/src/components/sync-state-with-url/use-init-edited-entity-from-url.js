/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';
import { privateApis as routerPrivateApis } from '@wordpress/router';

/**
 * Internal dependencies
 */
import { store as editSiteStore } from '../../store';
import { unlock } from '../../private-apis';

const { useLocation } = unlock( routerPrivateApis );

export default function useInitEditedEntityFromURL() {
	const { params: { postId, postType } = {} } = useLocation();
	const { isRequestingSite, homepageId, url } = useSelect( ( select ) => {
		const { getSite, getUnstableBase } = select( coreDataStore );
		const siteData = getSite();
		const base = getUnstableBase();

		return {
			isRequestingSite: ! base,
			homepageId:
				siteData?.show_on_front === 'page'
					? siteData.page_on_front
					: null,
			url: base?.home,
		};
	}, [] );

	const { setTemplate, setTemplatePart, setPage } =
		useDispatch( editSiteStore );

	useEffect( () => {
		if ( postType && postId ) {
			switch ( postType ) {
				case 'wp_template':
					setTemplate( postId );
					break;
				case 'wp_template_part':
					setTemplatePart( postId );
					break;
				default:
					setPage( {
						context: { postType, postId },
					} );
			}

			return;
		}

		// In all other cases, we need to set the home page in the site editor view.
		if ( homepageId ) {
			setPage( {
				context: { postType: 'page', postId: homepageId },
			} );
		} else if ( ! isRequestingSite ) {
			setPage( {
				path: url,
			} );
		}
	}, [
		url,
		postId,
		postType,
		homepageId,
		isRequestingSite,
		setPage,
		setTemplate,
		setTemplatePart,
	] );
}
