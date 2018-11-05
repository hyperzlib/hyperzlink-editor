## model for DualSpace engine (dsmh) ##

### chunk map (json) ###
```javascript
[{
    start: "${index of start frame}",
    file: "${chunk file name}",
    length: "${frames in this chunk}"
}]
```

### model header (binary) ###

| name              | value                     | length(byte)  |
| ----              | -----------               | ------------  |
| identity          | "dualspace"               | 9             |
| version           | version of model          | 4             |
| start length      | index of start frame      | 4             |
| frame length      | frames in this chunk      | 4             |
| data field        | model data                | +             |
