# Package APIs

Formation consists of two packages: `formation` and `formation-validators`. The exports of each of these packages are documented below.

### Formation

| Name | Type | Description |
| :--- | :--- | :--- |
| `default` | String | Name of the Formation Angular module. This should be added to your Angular module definition's dependencies array. |
| `configure` | Function | Formation configuration function. |
| `registerControl` | Function | Function used to register custom Formation controls. |
| `ConfigurableValidator` | Function | Factory for creating custom configurable validators. |
| `FormationControl` | Class | Base controller class used by all Formation controls. Can be extended when creating custom components. |

### Formation Validators

Each validator in this package is a named export. See the Validators section for example usage.