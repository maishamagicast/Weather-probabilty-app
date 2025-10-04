import h5py
import numpy as np

def extract_point_value(hdf_path: str, lat: float, lon: float, variable_key: str = "temperature") -> float:
    """
    Extracts a value from an HDF file for the nearest coordinate point.

    Args:
        hdf_path (str): Path to the HDF file (e.g., 'data/NASA_TEMPERATURE.hdf')
        lat (float): Latitude of the target location
        lon (float): Longitude of the target location
        variable_key (str): Dataset key (e.g., 'temperature', 'precipitation', 'humidity', 'windspeed')

    Returns:
        float: Value at the nearest (lat, lon) coordinate
    """
    try:
        with h5py.File(hdf_path, "r") as hdf:
            # Inspect available keys (for debugging or auto-selection)
            available_keys = list(hdf.keys())
            if variable_key not in available_keys:
                raise KeyError(
                    f"'{variable_key}' not found in file. Available datasets: {available_keys}"
                )

            lats = hdf["latitude"][:]
            lons = hdf["longitude"][:]
            data = hdf[variable_key][:]

            # Find nearest indices
            lat_idx = int(np.abs(lats - lat).argmin())
            lon_idx = int(np.abs(lons - lon).argmin())

            value = data[lat_idx, lon_idx]
            return float(value)

    except Exception as e:
        print(f"Error reading {hdf_path}: {e}")
        return None


def extract_multiple_variables(hdf_path: str, lat: float, lon: float, variables: list):
    """
    Extract multiple variable values for a given coordinate from one HDF file.
    Useful when file stores multiple datasets (e.g., temperature, humidity).

    Returns a dictionary like:
    {
        "temperature": 24.3,
        "humidity": 65.2,
        "windspeed": 3.1
    }
    """
    results = {}
    for var in variables:
        val = extract_point_value(hdf_path, lat, lon, var)
        if val is not None:
            results[var] = round(val, 2)
    return results
