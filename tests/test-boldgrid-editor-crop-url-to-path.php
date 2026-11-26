<?php
/**
 * Boldgrid_Editor_Crop::url_to_path() only maps URLs under the uploads URL.
 *
 * @package Test_Boldgrid_Editor
 */

/**
 * Class: Test_Boldgrid_Editor_Crop_Url_To_Path
 */
class Test_Boldgrid_Editor_Crop_Url_To_Path extends WP_UnitTestCase {

	/**
	 * Uploads URL the upload_dir filter reports, or null to leave it alone.
	 *
	 * @var string|null
	 */
	private $baseurl;

	/**
	 * Remove the upload_dir override.
	 */
	public function tearDown(): void {
		remove_filter( 'upload_dir', array( $this, 'filter_upload_dir' ) );
		parent::tearDown();
	}

	/**
	 * Report $this->baseurl as the uploads URL.
	 *
	 * @param array $uploads wp_upload_dir() result.
	 * @return array
	 */
	public function filter_upload_dir( $uploads ) {
		$uploads['baseurl'] = $this->baseurl;

		return $uploads;
	}

	/**
	 * A URL under the uploads URL maps into the uploads directory.
	 */
	public function test_maps_url_under_uploads() {
		$uploads = wp_upload_dir();
		$crop    = new Boldgrid_Editor_Crop();

		$this->assertSame(
			$uploads['basedir'] . DIRECTORY_SEPARATOR . '2016' . DIRECTORY_SEPARATOR . '01' . DIRECTORY_SEPARATOR . 'image.jpg',
			$crop->url_to_path( $uploads['baseurl'] . '/2016/01/image.jpg' )
		);
	}

	/**
	 * URLs outside the uploads URL are rejected.
	 */
	public function test_rejects_url_outside_uploads() {
		$crop = new Boldgrid_Editor_Crop();

		$this->assertFalse( $crop->url_to_path( 'https://example.org/wp-content/uploads/image.jpg' ) );
		$this->assertFalse( $crop->url_to_path( '/2016/01/image.jpg' ) );
	}

	/**
	 * Data for test_dot_segments_stay_in_uploads().
	 *
	 * @return array
	 */
	public function traversal_provider() {
		return array(
			'plain'        => array( '/../../../etc/passwd', 'etc/passwd' ),
			'encoded'      => array( '/%2e%2e/%2e%2e/etc/passwd', 'etc/passwd' ),
			'backslash'    => array( '/..\\..\\etc\\passwd', 'etc/passwd' ),
			'mid-path'     => array( '/2016/../../01/image.jpg', '01/image.jpg' ),
			'current-dirs' => array( '/./2016/./image.jpg', '2016/image.jpg' ),
		);
	}

	/**
	 * Dot segments collapse inside the uploads directory instead of leaving it.
	 *
	 * @dataProvider traversal_provider
	 *
	 * @param string $suffix   Path appended to the uploads URL.
	 * @param string $expected Path the URL maps to, relative to the uploads directory.
	 */
	public function test_dot_segments_stay_in_uploads( $suffix, $expected ) {
		$uploads = wp_upload_dir();

		$this->assertSame(
			$uploads['basedir'] . DIRECTORY_SEPARATOR . str_replace( '/', DIRECTORY_SEPARATOR, $expected ),
			( new Boldgrid_Editor_Crop() )->url_to_path( $uploads['baseurl'] . $suffix )
		);
	}

	/**
	 * Without an uploads URL nothing maps, including a root-relative path that would match a bare "/".
	 */
	public function test_rejects_everything_without_uploads_url() {
		$this->baseurl = '';
		add_filter( 'upload_dir', array( $this, 'filter_upload_dir' ) );

		$this->assertSame( '', wp_upload_dir()['baseurl'] );
		$this->assertFalse( ( new Boldgrid_Editor_Crop() )->url_to_path( '/2016/01/image.jpg' ) );
	}
}
