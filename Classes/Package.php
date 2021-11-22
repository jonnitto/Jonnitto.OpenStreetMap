<?php

namespace Jonnitto\OpenStreetMap;

use Jonnitto\OpenStreetMap\Service\GeocodingService;
use Neos\ContentRepository\Domain\Model\Node;
use Neos\Flow\Core\Bootstrap;
use Neos\Flow\Package\Package as BasePackage;

/**
 * Update latitude and longitude for nodes
 */
class Package extends BasePackage
{
    /**
     * @param Bootstrap $bootstrap The current bootstrap
     * @return void
     */
    public function boot(Bootstrap $bootstrap)
    {
        $dispatcher = $bootstrap->getSignalSlotDispatcher();
        $dispatcher->connect(Node::class, 'nodePropertyChanged', GeocodingService::class, 'nodePropertyChanged');
    }
}
