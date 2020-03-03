#!/usr/bin/env bash
##~---------------------------------------------------------------------------##
##                        _      _                 _   _                      ##
##                    ___| |_ __| |_ __ ___   __ _| |_| |_                    ##
##                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   ##
##                   \__ \ || (_| | | | | | | (_| | |_| |_                    ##
##                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   ##
##                                                                            ##
##  File      : build.sh                                                      ##
##  Project   : metaballs                                                     ##
##  Date      : Mar 03, 2020                                                  ##
##  License   : GPLv3                                                         ##
##  Author    : stdmatt <stdmatt@pixelwizards.io>                             ##
##  Copyright : stdmatt 2020                                                  ##
##                                                                            ##
##  Description :                                                             ##
##                                                                            ##
##---------------------------------------------------------------------------~##

##----------------------------------------------------------------------------##
## Imports                                                                    ##
##----------------------------------------------------------------------------##
source /usr/local/src/stdmatt/shellscript_utils/main.sh


##----------------------------------------------------------------------------##
## Variables                                                                  ##
##----------------------------------------------------------------------------##
SCRIPT_DIR="$(pw_get_script_dir)";
ROOT_DIR="$(pw_abspath "${SCRIPT_DIR}/..")";
BUILD_DIR="${ROOT_DIR}/build";
TO_COPY="libs/ src/ index.html";


##----------------------------------------------------------------------------##
## Script                                                                     ##
##----------------------------------------------------------------------------##
echo "Cleaning build directory";
rm    -rf "$BUILD_DIR";
mkdir -p  "$BUILD_DIR";


echo "Copying files to build directory";
for ITEM in $TO_COPY; do
    cp -R "${ROOT_DIR}/${ITEM}" "${BUILD_DIR}";
done;

find ${BUILD_DIR} -iname ".git*" -exec rm -rf {} \;
