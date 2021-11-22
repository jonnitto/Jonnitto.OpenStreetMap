<?php

namespace Jonnitto\OpenStreetMap\DataSource;

use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Neos\Service\DataSource\AbstractDataSource;
use Neos\Flow\I18n\EelHelper\TranslationHelper;
use Exception;


class ColorShiftDataSource extends AbstractDataSource
{
    /**
     * @var string
     */
    static protected $identifier = 'jonnitto-openstreetmap-colorshift';

    /**
     * @Flow\Inject
     * @var TranslationHelper
     */
    protected $translationHelper;

    /**
     * @Flow\InjectConfiguration("colorShiftPreviewPattern")
     * @var string
     */
    protected $previewPattern;


    /**
     * @Flow\Inject
     * @var ResourceManager
     */
    protected $resourceManager;


    /**
     * @param NodeInterface $node The node that is currently edited (optional)
     * @param array $arguments Additional arguments (key / value)
     * @return array
     * @throws Exception
     */
    public function getData(NodeInterface $node = null, array $arguments = [])
    {
        $colors = ['grayscale', 'dark'];
        $values = [];
        foreach ($colors as $color) {
            $preview = sprintf($this->previewPattern, $color);
            if (strpos($preview, 'resource://') === 0) {
                $matches = [];
                if (preg_match('#^resource://([^/]+)/Public/(.*)#', $preview, $matches) !== 1) {
                    throw new Exception(sprintf('The specified path "%s" does not point to a public resource.', $preview), 1637609336);
                }
                $package = $matches[1];
                $path = $matches[2];
                $preview = $this->resourceManager->getPublicPackageResourceUri($package, $path);
            }

            $values[] = [
                'label' => $this->translationHelper->translate('properties.colorShift.selectBoxEditor.values.' . $color, $color, [], 'NodeTypes/Mixin/ColorShift', 'Jonnitto.OpenStreetMap'),
                'value' => $color,
                'preview' => $preview,
            ];
        }

        return $values;
    }
}
