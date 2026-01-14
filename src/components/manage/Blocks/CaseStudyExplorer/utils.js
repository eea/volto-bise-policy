export function centerAndResetMapZoom({ map, ol }) {
  map.getView().animate({
    zoom: 4,
    duration: 1000,
    center: ol.proj.transform([10, 49], 'EPSG:4326', 'EPSG:3857'),
  });
}

export function scrollToElement(elementId) {
  const element = document.getElementById(elementId);
  element.scrollIntoView({
    behavior: 'smooth',
  });
}

export function getExtentOfFeatures({ features, ol }) {
  const points = features.map((f) => f.getGeometry().flatCoordinates);
  const point = new ol.geom.MultiPoint(points);
  return point.getExtent();
}

export function zoomMapToFeatures({ map, features, threshold = 500, ol }) {
  const extent = getExtentOfFeatures({ features, ol });
  let extentBuffer = (extent[3] - extent[1] + extent[2] - extent[0]) / 4;
  extentBuffer = extentBuffer < threshold ? threshold : extentBuffer;
  const paddedExtent = ol.extent.buffer(extent, extentBuffer);
  map.getView().fit(paddedExtent, { ...map.getSize(), duration: 1000 });
}

export function getFeatures({ cases, ol }) {
  const Feature = ol.ol.Feature;

  return cases.map((c, index) => {
    const {
      geometry: { coordinates },
    } = c;
    const point = new Feature(
      new ol.geom.Point(ol.proj.fromLonLat(coordinates)),
    );
    point.setId(index);
    point.setProperties(
      {
        title: c.properties.title,
        image: c.properties.image,
        nwrm_type: c.properties.nwrm_type,
        nwrms_implemented: c.properties.measures,
        description: c.properties.description,
        sectors: c.properties.sectors,
        index: index,
        path: c.properties.path,
        color: c.properties.nwrm_type === 'Light' ? '#50B0A4' : '#0083E0',
      },
      false,
    );
    return point;
  });
}

export function filterCases(cases, activeFilters, caseStudiesIds, searchInput) {
  const data = cases.filter((_case) => {
    let flag_searchInput = false;
    let flag_implemented = false;
    let flag_sectors = false;
    let flag_case = caseStudiesIds
      ? caseStudiesIds.includes(_case.properties.url.split('/').pop())
      : true;

    if (!searchInput) {
      flag_searchInput = true;
    } else {
      if (_case.properties.title.toLowerCase().match(searchInput)) {
        flag_searchInput = true;
      } else if (
        _case.properties.description.toLowerCase().match(searchInput)
      ) {
        flag_searchInput = true;
      }
    }

    if (!activeFilters.nwrms_implemented.length) {
      flag_implemented = true;
    } else {
      let nwrms_implemented = _case.properties.measures?.map((item) => {
        return item['id'].toString();
      });

      activeFilters.nwrms_implemented.forEach((filter) => {
        if (nwrms_implemented?.includes(filter)) flag_implemented = true;
      });
    }

    if (!activeFilters.sectors.length) {
      flag_sectors = true;
    } else {
      let sectors = _case.properties.sectors?.map((item) => {
        return item.toString();
      });

      activeFilters.sectors.forEach((filter) => {
        if (sectors?.includes(filter)) flag_sectors = true;
      });
    }

    return flag_case && flag_implemented && flag_sectors && flag_searchInput
      ? _case
      : false;
  });

  return data;
}

export function getFilters(cases) {
  let _filters = {
    nwrms_implemented: {},
    sectors: {},
  };

  for (let key of Object.keys(cases)) {
    const _case = cases[key];
    let nwrms_implemented = _case.properties.measures;
    nwrms_implemented.map((item) => {
      if (!_filters.nwrms_implemented.hasOwnProperty(item['id'])) {
        _filters.nwrms_implemented[item['id']] = item['title'];
      }
      return [];
    });

    let sectors = _case.properties.sectors;
    sectors.map((item) => {
      if (!_filters.sectors.hasOwnProperty(item)) {
        _filters.sectors[item] = item;
      }
      return [];
    });
  }

  return _filters;
}
